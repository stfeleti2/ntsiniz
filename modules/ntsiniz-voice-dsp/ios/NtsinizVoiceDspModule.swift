import ExpoModulesCore
import Foundation

private struct DspSession {
  var noiseFloor: Double = 0.004
  var frames: Int = 0
  var voicedFrames: Int = 0
  var suppressionMode: String = "conservativeAdaptive"
}

public class NtsinizVoiceDspModule: Module {
  private var sessions: [String: DspSession] = [:]

  public func definition() -> ModuleDefinition {
    Name("NtsinizVoiceDsp")

    Function("createSession") { (opts: [String: Any]) -> String in
      return self.createSessionInternal(opts)
    }
    Function("processFrame") { (sessionId: String, pcmBase64: String, sampleRate: Int) -> [String: Any] in
      return try self.processFrameInternal(sessionId: sessionId, pcmBase64: pcmBase64, sampleRate: sampleRate)
    }
    Function("closeSession") { (sessionId: String) in
      self.closeSessionInternal(sessionId: sessionId)
    }

    AsyncFunction("createSessionAsync") { (opts: [String: Any]) -> String in
      return self.createSessionInternal(opts)
    }
    AsyncFunction("processFrameAsync") { (sessionId: String, pcmBase64: String, sampleRate: Int) -> [String: Any] in
      return try self.processFrameInternal(sessionId: sessionId, pcmBase64: pcmBase64, sampleRate: sampleRate)
    }
    AsyncFunction("closeSessionAsync") { (sessionId: String) in
      self.closeSessionInternal(sessionId: sessionId)
    }
  }

  private func createSessionInternal(_ opts: [String: Any]) -> String {
    let id = UUID().uuidString
    let suppression = (opts["suppressionMode"] as? String) ?? "conservativeAdaptive"
    self.sessions[id] = DspSession(noiseFloor: 0.004, frames: 0, voicedFrames: 0, suppressionMode: suppression)
    return id
  }

  private func closeSessionInternal(sessionId: String) {
    self.sessions.removeValue(forKey: sessionId)
  }

  private func processFrameInternal(sessionId: String, pcmBase64: String, sampleRate: Int) throws -> [String: Any] {
    guard var session = self.sessions[sessionId] else {
      throw NSError(domain: "NtsinizVoiceDsp", code: 1, userInfo: [NSLocalizedDescriptionKey: "session not found"])
    }
    guard let data = Data(base64Encoded: pcmBase64) else {
      throw NSError(domain: "NtsinizVoiceDsp", code: 2, userInfo: [NSLocalizedDescriptionKey: "bad base64"])
    }

    let bytesPerSample = 2
    let sampleCount = max(1, data.count / bytesPerSample)
    var sum = 0.0
    var peak = 0.0
    var crossings = 0
    var prev: Int16 = 0
    var hasPrev = false

    data.withUnsafeBytes { (raw: UnsafeRawBufferPointer) in
      let p = raw.bindMemory(to: Int16.self)
      for i in 0..<p.count {
        let s = p[i]
        let f = Double(s) / 32768.0
        sum += f * f
        let a = abs(f)
        if a > peak { peak = a }
        if hasPrev {
          if (prev < 0 && s > 0) || (prev > 0 && s < 0) {
            crossings += 1
          }
        } else {
          hasPrev = true
        }
        prev = s
      }
    }

    let rms = sqrt(sum / Double(sampleCount))
    let snrDb = 20.0 * log10((rms + 1e-7) / (session.noiseFloor + 1e-7))
    let zcr = Double(crossings) / Double(max(1, sampleCount - 1))

    let snrComponent = 1.0 / (1.0 + exp(-((snrDb - 6.0) / 4.5)))
    let levelComponent = 1.0 / (1.0 + exp(-((rms - 0.011) * 160.0)))
    let zcrPenalty = zcr > 0.35 ? 0.8 : 1.0
    let vadProb = min(1.0, max(0.0, (snrComponent * 0.62 + levelComponent * 0.38) * zcrPenalty))
    let voiced = vadProb >= 0.56 && rms >= session.noiseFloor * 1.12

    if !voiced {
      let smoothing = session.suppressionMode == "off" ? 0.02 : 0.08
      session.noiseFloor = min(0.18, max(0.0008, session.noiseFloor * (1.0 - smoothing) + rms * smoothing))
    } else {
      session.noiseFloor = min(0.18, max(0.0008, session.noiseFloor * 0.995 + rms * 0.005))
    }

    session.frames += 1
    if voiced { session.voicedFrames += 1 }
    self.sessions[sessionId] = session

    let voicedRatio = Double(session.voicedFrames) / Double(max(1, session.frames))
    let clipping = peak >= 0.985
    let signalQuality = qualityGrade(snrDb: snrDb, clipping: clipping, voicedRatio: voicedRatio)

    return [
      "vadProb": vadProb,
      "noiseFloorDb": 20.0 * log10(max(session.noiseFloor, 1e-7)),
      "snrDb": snrDb,
      "clipping": clipping,
      "voicedRatio": voicedRatio,
      "signalQuality": signalQuality,
      "sampleRate": sampleRate
    ]
  }
}

private func qualityGrade(snrDb: Double, clipping: Bool, voicedRatio: Double) -> String {
  if clipping { return "poor" }
  if snrDb < 5.0 { return "poor" }
  if snrDb < 10.0 { return "fair" }
  if voicedRatio < 0.12 { return "fair" }
  if snrDb < 17.0 { return "good" }
  return "excellent"
}
