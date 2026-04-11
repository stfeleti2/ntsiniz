package com.ntsiniz.voicedsp

import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.abs
import kotlin.math.exp
import kotlin.math.log10
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

private data class DspSession(
  var noiseFloor: Double = 0.004,
  var frames: Int = 0,
  var voicedFrames: Int = 0,
  var suppressionMode: String = "conservativeAdaptive"
)

class NtsinizVoiceDspModule : Module() {
  private val sessions = ConcurrentHashMap<String, DspSession>()

  override fun definition() = ModuleDefinition {
    Name("NtsinizVoiceDsp")

    Function("createSession") { opts: Map<String, Any?> ->
      createSessionInternal(opts)
    }
    Function("processFrame") { sessionId: String, pcmBase64: String, sampleRate: Int ->
      processFrameInternal(sessionId, pcmBase64, sampleRate)
    }
    Function("closeSession") { sessionId: String ->
      closeSessionInternal(sessionId)
    }

    AsyncFunction("createSessionAsync") { opts: Map<String, Any?> ->
      createSessionInternal(opts)
    }
    AsyncFunction("processFrameAsync") { sessionId: String, pcmBase64: String, sampleRate: Int ->
      processFrameInternal(sessionId, pcmBase64, sampleRate)
    }
    AsyncFunction("closeSessionAsync") { sessionId: String ->
      closeSessionInternal(sessionId)
    }
  }

  private fun createSessionInternal(opts: Map<String, Any?>): String {
    val id = UUID.randomUUID().toString()
    val suppression = (opts["suppressionMode"] as? String) ?: "conservativeAdaptive"
    sessions[id] = DspSession(suppressionMode = suppression)
    return id
  }

  private fun closeSessionInternal(sessionId: String) {
    sessions.remove(sessionId)
  }

  private fun processFrameInternal(sessionId: String, pcmBase64: String, sampleRate: Int): Map<String, Any> {
    val session = sessions[sessionId] ?: throw IllegalStateException("session not found")
    val bytes = try {
      Base64.decode(pcmBase64, Base64.DEFAULT)
    } catch (_: Throwable) {
      throw IllegalArgumentException("bad base64")
    }

    val sampleCount = max(1, bytes.size / 2)
    var sum = 0.0
    var peak = 0.0
    var crossings = 0
    var prev = 0.0
    var hasPrev = false

    var index = 0
    while (index + 1 < bytes.size) {
      val lo = bytes[index].toInt() and 0xFF
      val hi = bytes[index + 1].toInt() shl 8
      val sample = (hi or lo).toShort().toInt()
      val normalized = sample / 32768.0
      sum += normalized * normalized
      val absValue = abs(normalized)
      if (absValue > peak) peak = absValue
      if (hasPrev) {
        if (prev < 0 && normalized > 0 || prev > 0 && normalized < 0) crossings += 1
      } else {
        hasPrev = true
      }
      prev = normalized
      index += 2
    }

    val rms = sqrt(sum / sampleCount.toDouble())
    val snrDb = 20.0 * log10((rms + 1e-7) / (session.noiseFloor + 1e-7))
    val zcr = crossings.toDouble() / max(1, sampleCount - 1).toDouble()

    val snrComponent = 1.0 / (1.0 + exp(-((snrDb - 6.0) / 4.5)))
    val levelComponent = 1.0 / (1.0 + exp(-((rms - 0.011) * 160.0)))
    val zcrPenalty = if (zcr > 0.35) 0.8 else 1.0
    val vadProb = clamp01((snrComponent * 0.62 + levelComponent * 0.38) * zcrPenalty)
    val voiced = vadProb >= 0.56 && rms >= session.noiseFloor * 1.12

    if (!voiced) {
      val smoothing = if (session.suppressionMode == "off") 0.02 else 0.08
      session.noiseFloor = clampNoiseFloor(session.noiseFloor * (1.0 - smoothing) + rms * smoothing)
    } else {
      session.noiseFloor = clampNoiseFloor(session.noiseFloor * 0.995 + rms * 0.005)
    }

    session.frames += 1
    if (voiced) session.voicedFrames += 1
    sessions[sessionId] = session

    val voicedRatio = session.voicedFrames.toDouble() / max(1, session.frames).toDouble()
    val clipping = peak >= 0.985

    return mapOf(
      "vadProb" to vadProb,
      "noiseFloorDb" to (20.0 * log10(max(session.noiseFloor, 1e-7))),
      "snrDb" to snrDb,
      "clipping" to clipping,
      "voicedRatio" to voicedRatio,
      "signalQuality" to qualityGrade(snrDb = snrDb, clipping = clipping, voicedRatio = voicedRatio),
      "sampleRate" to sampleRate
    )
  }
}

private fun qualityGrade(snrDb: Double, clipping: Boolean, voicedRatio: Double): String {
  if (clipping) return "poor"
  if (snrDb < 5.0) return "poor"
  if (snrDb < 10.0) return "fair"
  if (voicedRatio < 0.12) return "fair"
  if (snrDb < 17.0) return "good"
  return "excellent"
}

private fun clamp01(v: Double): Double = min(1.0, max(0.0, v))

private fun clampNoiseFloor(v: Double): Double = min(0.18, max(0.0008, v))
