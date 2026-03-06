import ExpoModulesCore
import AVFoundation

public class WavFileWriterModule: Module {
  private struct WriterState {
    var fileHandle: FileHandle
    var fileUrl: URL
    var sampleRate: Int
    var channels: Int
    var bytesWritten: Int
  }

  private var writers: [String: WriterState] = [:]

  public func definition() -> ModuleDefinition {
    Name("WavFileWriter")

    AsyncFunction("getInputAudioCapabilitiesAsync") { () -> [String: Any] in
      let session = AVAudioSession.sharedInstance()
      // AVAudioSession doesn't expose a definitive supported list; return best-effort.
      let nativeRate = Int(session.sampleRate)
      let bufMs = max(1, Int(session.ioBufferDuration * 1000.0))

      let route = session.currentRoute
      let routeDesc = route.outputs.map { $0.portType.rawValue }.joined(separator: ",")

      return [
        "sampleRateHz": nativeRate > 0 ? nativeRate : 48000,
        "channels": 1,
        "ioBufferDurationMs": bufMs,
        "supportedSampleRatesHz": Array(Set([nativeRate, 48000, 44100])).filter { $0 > 0 },
        "supportedChannelCounts": [1],
        "routeDescription": routeDesc,
        "probedAtMs": Int(Date().timeIntervalSince1970 * 1000)
      ]
    }

    // Handle-based API
    AsyncFunction("openWriterAsync") { (path: String, sr: Int, ch: Int) -> String in
      let writerId = UUID().uuidString
      let url = URL(fileURLWithPath: path)
      let fm = FileManager.default
      let dir = url.deletingLastPathComponent()
      if !fm.fileExists(atPath: dir.path) {
        try fm.createDirectory(at: dir, withIntermediateDirectories: true, attributes: nil)
      }
      if fm.fileExists(atPath: url.path) {
        throw NSError(domain: "WavFileWriter", code: 3, userInfo: [NSLocalizedDescriptionKey: "file already exists"])
      }
      // Create file.
      fm.createFile(atPath: url.path, contents: nil)
      let fh = try FileHandle(forWritingTo: url)
      // Write placeholder header (44 bytes)
      let header = WavFileWriterModule.makeWavHeader(sampleRate: sr, channels: ch, dataBytes: 0)
      try fh.write(contentsOf: header)

      self.writers[writerId] = WriterState(
        fileHandle: fh,
        fileUrl: url,
        sampleRate: sr,
        channels: ch,
        bytesWritten: 0
      )

      return writerId
    }

    AsyncFunction("appendPcm16leBase64Async") { (writerId: String, pcmBase64: String) -> [String: Any] in
      guard var st = self.writers[writerId] else {
        throw NSError(domain: "WavFileWriter", code: 1, userInfo: [NSLocalizedDescriptionKey: "writer not found"])
      }
      guard let data = Data(base64Encoded: pcmBase64) else {
        throw NSError(domain: "WavFileWriter", code: 2, userInfo: [NSLocalizedDescriptionKey: "bad base64"])
      }


      // Validate PCM16LE frame alignment.
      let bytesPerFrame = 2 * max(1, st.channels)
      if data.count % bytesPerFrame != 0 {
        throw NSError(domain: "WavFileWriter", code: 3, userInfo: [NSLocalizedDescriptionKey: "unaligned pcm chunk"])
      }
      // Peak estimate + clipping (PCM16LE)
      var peak: Int16 = 0
      var clipped = false
      data.withUnsafeBytes { (raw: UnsafeRawBufferPointer) in
        let p = raw.bindMemory(to: Int16.self)
        for i in 0..<p.count {
          let v = p[i]
          let av = v == Int16.min ? Int16.max : abs(v)
          if av > peak { peak = av }
          if v == Int16.max || v == Int16.min { clipped = true }
        }
      }

      try st.fileHandle.write(contentsOf: data)
      st.bytesWritten += data.count
      self.writers[writerId] = st

      return ["peak": Int(peak), "clipped": clipped]
    }

    // Batch append to reduce JS->native call overhead.
    AsyncFunction("appendPcm16leBase64BatchAsync") { (writerId: String, chunks: [String]) -> [String: Any] in
      guard var st = self.writers[writerId] else {
        throw NSError(domain: "WavFileWriter", code: 1, userInfo: [NSLocalizedDescriptionKey: "writer not found"])
      }

      var peak: Int16 = 0
      var clipped = false

      for b64 in chunks {
        guard let data = Data(base64Encoded: b64) else { continue }
        let bytesPerFrame = 2 * max(1, st.channels)
        if data.count % bytesPerFrame != 0 { continue }
        data.withUnsafeBytes { (raw: UnsafeRawBufferPointer) in
          let p = raw.bindMemory(to: Int16.self)
          for i in 0..<p.count {
            let v = p[i]
            let av = v == Int16.min ? Int16.max : abs(v)
            if av > peak { peak = av }
            if v == Int16.max || v == Int16.min { clipped = true }
          }
        }
        try st.fileHandle.write(contentsOf: data)
        st.bytesWritten += data.count
      }

      self.writers[writerId] = st
      return ["peak": Int(peak), "clipped": clipped]
    }

    AsyncFunction("finalizeAsync") { (writerId: String, totalSamples: Int) in
      guard let st = self.writers.removeValue(forKey: writerId) else { return }
      // Validate totalSamples (best-effort) to catch corruption/mismatched framing.
      let expectedBytes = max(0, totalSamples) * max(1, st.channels) * 2
      if expectedBytes != st.bytesWritten {
        NSLog("[WavFileWriter] finalize mismatch: expectedBytes=%d bytesWritten=%d", expectedBytes, st.bytesWritten)
      }
      // Update header with true data size.
      let hdr = WavFileWriterModule.makeWavHeader(sampleRate: st.sampleRate, channels: st.channels, dataBytes: st.bytesWritten)
      try st.fileHandle.synchronize()
      try st.fileHandle.seek(toOffset: 0)
      try st.fileHandle.write(contentsOf: hdr)
      try st.fileHandle.close()
    }

    AsyncFunction("abortAsync") { (writerId: String) in
      guard let st = self.writers.removeValue(forKey: writerId) else { return }
      do { try st.fileHandle.close() } catch {}
      try? FileManager.default.removeItem(at: st.fileUrl)
    }
  }

  private static func makeWavHeader(sampleRate: Int, channels: Int, dataBytes: Int) -> Data {
    let byteRate = sampleRate * channels * 2
    let blockAlign = channels * 2
    let riffChunkSize = 36 + dataBytes
    var d = Data()
    d.append(contentsOf: [0x52,0x49,0x46,0x46]) // RIFF
    d.append(UInt32(riffChunkSize).littleEndianData)
    d.append(contentsOf: [0x57,0x41,0x56,0x45]) // WAVE
    d.append(contentsOf: [0x66,0x6D,0x74,0x20]) // fmt 
    d.append(UInt32(16).littleEndianData)
    d.append(UInt16(1).littleEndianData) // PCM
    d.append(UInt16(channels).littleEndianData)
    d.append(UInt32(sampleRate).littleEndianData)
    d.append(UInt32(byteRate).littleEndianData)
    d.append(UInt16(blockAlign).littleEndianData)
    d.append(UInt16(16).littleEndianData) // bits
    d.append(contentsOf: [0x64,0x61,0x74,0x61]) // data
    d.append(UInt32(dataBytes).littleEndianData)
    return d
  }
}

fileprivate extension FixedWidthInteger {
  var littleEndianData: Data {
    var v = self.littleEndian
    return Data(bytes: &v, count: MemoryLayout<Self>.size)
  }
}
