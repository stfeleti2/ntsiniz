package com.ntsiniz.wavfilewriter

import android.media.AudioFormat
import android.media.AudioRecord
import android.os.SystemClock
import android.util.Base64
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.RandomAccessFile
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

private data class WriterState(
  val id: String,
  val finalPath: String,
  val tmpPath: String,
  val sampleRate: Int,
  val channels: Int,
  val raf: RandomAccessFile,
  var totalSamples: Long = 0L
)

private const val WAV_HEADER_BYTES = 44L

class WavFileWriterModule : Module() {
  private val writers = ConcurrentHashMap<String, WriterState>()

  override fun definition() = ModuleDefinition {
    Name("WavFileWriter")

    AsyncFunction("getInputAudioCapabilitiesAsync") {
      val candidates = listOf(48000, 44100, 32000, 24000, 22050, 16000)
      val supported = candidates.filter { sr ->
        AudioRecord.getMinBufferSize(
          sr,
          AudioFormat.CHANNEL_IN_MONO,
          AudioFormat.ENCODING_PCM_16BIT
        ) > 0
      }

      val chosen = supported.firstOrNull() ?: 44100

      val minBufBytes = AudioRecord.getMinBufferSize(
        chosen,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_16BIT
      ).coerceAtLeast(0)

      val bytesPerFrame = 2 /* int16 */ * 1 /* mono */
      val frames = if (bytesPerFrame > 0) minBufBytes.toDouble() / bytesPerFrame.toDouble() else 0.0
      val ioMs = if (chosen > 0) (frames * 1000.0 / chosen.toDouble()) else 0.0

      mapOf(
        "sampleRateHz" to chosen,
        "channels" to 1,
        "ioBufferDurationMs" to ioMs.toInt().coerceAtLeast(0),
        "supportedSampleRatesHz" to supported,
        "supportedChannelCounts" to listOf(1),
        "routeDescription" to "android/MIC",
        "probedAtMs" to SystemClock.elapsedRealtime()
      )
    }

    AsyncFunction("openWriterAsync") { path: String, sampleRate: Int, channels: Int ->
      val id = UUID.randomUUID().toString()
      val sr = sampleRate.coerceAtLeast(1)
      val ch = channels.coerceAtLeast(1)

      val finalFile = File(path)
      val tmpFile = if (path.endsWith(".tmp")) finalFile else File("$path.tmp")

      finalFile.parentFile?.mkdirs()
      tmpFile.parentFile?.mkdirs()

      if (finalFile.exists()) {
        throw IllegalStateException("file already exists")
      }
      if (tmpFile.exists() && !tmpFile.delete()) {
        throw IllegalStateException("stale tmp file could not be deleted")
      }

      val raf = RandomAccessFile(tmpFile, "rw")
      raf.setLength(0)
      writeWavHeader(raf, sr, ch, 0)

      writers[id] = WriterState(
        id = id,
        finalPath = finalFile.absolutePath,
        tmpPath = tmpFile.absolutePath,
        sampleRate = sr,
        channels = ch,
        raf = raf
      )
      id
    }


    AsyncFunction("appendPcm16leBase64Async") { writerId: String, pcmBase64: String ->
      val st = writers[writerId] ?: throw IllegalStateException("writer not found")
      val bytes = try {
        Base64.decode(pcmBase64, Base64.DEFAULT)
      } catch (_: IllegalArgumentException) {
        throw IllegalArgumentException("bad base64")
      }
      val bytesPerFrame = 2 * (st.channels.coerceAtLeast(1))
      if (bytes.size % bytesPerFrame != 0) {
        throw IllegalArgumentException("unaligned pcm chunk")
      }

      if (bytes.isNotEmpty()) st.raf.write(bytes)

      // Compute peak + clipped
      var peak = 0
      var clipped = false
      var i = 0
      while (i + 1 < bytes.size) {
        val lo = bytes[i].toInt() and 0xFF
        val hi = bytes[i + 1].toInt() shl 8
        val s = (hi or lo).toShort().toInt()
        val a = if (s == Short.MIN_VALUE.toInt()) Short.MAX_VALUE.toInt() else kotlin.math.abs(s)
        if (a > peak) peak = a
        if (a >= 32760) clipped = true
        i += 2
      }
      st.totalSamples += bytes.size.toLong() / 2L

      mapOf(
        "peak" to peak,
        "clipped" to clipped
      )
    }

    // Batch append to reduce JS->native call overhead.
    AsyncFunction("appendPcm16leBase64BatchAsync") { writerId: String, chunks: List<String> ->
      val st = writers[writerId] ?: throw IllegalStateException("writer not found")

      var peak = 0
      var clipped = false
      for (b64 in chunks) {
        val bytes = try {
          Base64.decode(b64, Base64.DEFAULT)
        } catch (_: IllegalArgumentException) {
          continue
        }
        val bytesPerFrame = 2 * (st.channels.coerceAtLeast(1))
        if (bytes.size % bytesPerFrame != 0) {
          continue
        }

        if (bytes.isNotEmpty()) st.raf.write(bytes)

        var i = 0
        while (i + 1 < bytes.size) {
          val lo = bytes[i].toInt() and 0xFF
          val hi = bytes[i + 1].toInt() shl 8
          val s = (hi or lo).toShort().toInt()
          val a = if (s == Short.MIN_VALUE.toInt()) Short.MAX_VALUE.toInt() else kotlin.math.abs(s)
          if (a > peak) peak = a
          if (a >= 32760) clipped = true
          i += 2
        }
        st.totalSamples += bytes.size.toLong() / 2L
      }

      mapOf(
        "peak" to peak,
        "clipped" to clipped
      )
    }

    AsyncFunction("finalizeAsync") { writerId: String, totalSamples: Int ->
      val st = writers.remove(writerId) ?: return@AsyncFunction
      try {
        val fileLen = st.raf.length()
        val dataBytes = (fileLen - WAV_HEADER_BYTES).coerceAtLeast(0L)

        val expectedBytes = totalSamples.toLong().coerceAtLeast(0L) * st.channels.toLong().coerceAtLeast(1L) * 2L
        if (expectedBytes != 0L && expectedBytes != dataBytes) {
          Log.w("WavFileWriter", "finalize mismatch expectedBytes=$expectedBytes dataBytes=$dataBytes")
        }

        st.raf.seek(0)
        writeWavHeader(st.raf, st.sampleRate, st.channels, dataBytes)
        try {
          st.raf.fd.sync()
        } catch (_: Throwable) {}
      } finally {
        try { st.raf.close() } catch (_: Throwable) {}
      }

      val tmpFile = File(st.tmpPath)
      val finalFile = File(st.finalPath)
      if (!tmpFile.exists()) {
        throw IllegalStateException("tmp file missing before finalize move")
      }
      if (tmpFile.absolutePath != finalFile.absolutePath) {
        if (finalFile.exists()) {
          try { tmpFile.delete() } catch (_: Throwable) {}
          throw IllegalStateException("final file already exists")
        }
        if (!tmpFile.renameTo(finalFile)) {
          throw IllegalStateException("failed to rename tmp to final")
        }
      }
    }

    AsyncFunction("abortAsync") { writerId: String ->
      val st = writers.remove(writerId) ?: return@AsyncFunction
      try { st.raf.close() } catch (_: Throwable) {}
      try { File(st.tmpPath).delete() } catch (_: Throwable) {}
    }
  }

  private fun writeWavHeader(raf: RandomAccessFile, sampleRate: Int, channels: Int, dataBytes: Long) {
    val safeDataBytes = dataBytes.coerceIn(0L, Int.MAX_VALUE.toLong()).toInt()
    val byteRate = sampleRate * channels * 2
    val blockAlign = channels * 2
    val chunkSize = (36L + safeDataBytes.toLong()).coerceAtMost(Int.MAX_VALUE.toLong()).toInt()

    raf.seek(0)
    raf.writeBytes("RIFF")
    raf.writeIntLE(chunkSize)
    raf.writeBytes("WAVE")

    raf.writeBytes("fmt ")
    raf.writeIntLE(16)
    raf.writeShortLE(1)
    raf.writeShortLE(channels.toShort())
    raf.writeIntLE(sampleRate)
    raf.writeIntLE(byteRate)
    raf.writeShortLE(blockAlign.toShort())
    raf.writeShortLE(16)

    raf.writeBytes("data")
    raf.writeIntLE(safeDataBytes)
  }
}

private fun RandomAccessFile.writeIntLE(v: Int) {
  write(
    byteArrayOf(
      (v and 0xFF).toByte(),
      ((v shr 8) and 0xFF).toByte(),
      ((v shr 16) and 0xFF).toByte(),
      ((v shr 24) and 0xFF).toByte()
    )
  )
}

private fun RandomAccessFile.writeShortLE(v: Short) {
  val i = v.toInt()
  write(
    byteArrayOf(
      (i and 0xFF).toByte(),
      ((i shr 8) and 0xFF).toByte()
    )
  )
}
