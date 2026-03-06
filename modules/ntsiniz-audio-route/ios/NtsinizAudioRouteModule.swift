import ExpoModulesCore
import AVFoundation

public class NtsinizAudioRouteModule: Module {
  private var routeObserver: NSObjectProtocol?
  private var interruptionObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("NtsinizAudioRoute")

    Events("routeChanged", "interruption")

    AsyncFunction("getCurrentRoute") { () async throws -> [String: Any] in
      return self.currentRouteInfo()
    }

    AsyncFunction("listInputs") { () async throws -> [[String: Any]] in
      let session = AVAudioSession.sharedInstance()
      let inputs = session.availableInputs ?? []
      return inputs.map { port in
        self.portInfo(port)
      }
    }

    AsyncFunction("setPreferredInput") { (uid: String?) async throws -> Bool in
      let session = AVAudioSession.sharedInstance()
      guard let inputs = session.availableInputs else { return false }
      if uid == nil {
        try session.setPreferredInput(nil)
        return true
      }
      if let match = inputs.first(where: { $0.uid == uid }) {
        try session.setPreferredInput(match)
        return true
      }
      return false
    }

    AsyncFunction("configureVocalCapture") { (config: [String: Any]) async throws in
      try self.configureSession(config)
    }

    OnStartObserving {
      self.startObservers()
    }

    OnStopObserving {
      self.stopObservers()
    }
  }

  private func startObservers() {
    let center = NotificationCenter.default
    routeObserver = center.addObserver(forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main) { [weak self] note in
      guard let self = self else { return }
      self.sendEvent("routeChanged", self.currentRouteInfo(extra: note.userInfo))
    }
    interruptionObserver = center.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] note in
      guard let self = self else { return }
      var payload = self.currentRouteInfo(extra: note.userInfo)
      payload["kind"] = "interruption"
      self.sendEvent("interruption", payload)
    }
  }

  private func stopObservers() {
    let center = NotificationCenter.default
    if let o = routeObserver { center.removeObserver(o) }
    if let o = interruptionObserver { center.removeObserver(o) }
    routeObserver = nil
    interruptionObserver = nil
  }

  private func configureSession(_ config: [String: Any]) throws {
    let session = AVAudioSession.sharedInstance()
    let allowBluetooth = (config["allowBluetooth"] as? Bool) ?? true
    let preferBuiltIn = (config["preferBuiltInMic"] as? Bool) ?? false
    let preferredSR = config["preferredSampleRateHz"] as? Double
    let preferredBufMs = config["preferredIOBufferDurationMs"] as? Double

    var opts: AVAudioSession.CategoryOptions = [.mixWithOthers]
    // For mic capture + playback
    opts.insert(.defaultToSpeaker)
    if allowBluetooth {
      opts.insert(.allowBluetoothHFP) // SCO/HFP input
      // A2DP does not provide mic, but allowing it can route output; keep it.
      opts.insert(.allowBluetoothA2DP)
    }

    try session.setCategory(.playAndRecord, mode: .measurement, options: opts)

    if let sr = preferredSR {
      try session.setPreferredSampleRate(sr)
    }
    if let ms = preferredBufMs {
      try session.setPreferredIOBufferDuration(ms / 1000.0)
    }

    try session.setActive(true, options: .notifyOthersOnDeactivation)

    if preferBuiltIn {
      // Try to choose built-in mic if available.
      if let inputs = session.availableInputs {
        if let builtIn = inputs.first(where: { $0.portType == .builtInMic }) {
          try? session.setPreferredInput(builtIn)
        }
      }
    }
  }

  private func routeType(_ portType: AVAudioSession.Port) -> String {
    switch portType {
    case .builtInMic: return "built_in_mic"
    case .headsetMic: return "wired_headset"
    case .bluetoothHFP: return "bluetooth_sco"
    case .bluetoothA2DP: return "bluetooth_a2dp"
    case .bluetoothLE: return "bluetooth_le"
    default: return "unknown"
    }
  }

  private func portInfo(_ port: AVAudioSessionPortDescription) -> [String: Any] {
    let channelCount = port.channels?.count ?? 0
    return [
      "routeType": routeType(port.portType),
      "inputName": port.portName,
      "inputUid": port.uid,
      "isBluetoothInput": port.portType == .bluetoothHFP || port.portType == .bluetoothLE,
      "raw": [
        "portType": port.portType.rawValue,
        "channels": channelCount > 0 ? Array(1...channelCount) : []
      ]
    ]
  }

  private func currentRouteInfo(extra: [AnyHashable: Any]? = nil) -> [String: Any] {
    let session = AVAudioSession.sharedInstance()
    let route = session.currentRoute
    let input = route.inputs.first
    var payload: [String: Any] = [
      "routeType": input != nil ? routeType(input!.portType) : "unknown",
      "inputName": input?.portName ?? "",
      "inputUid": input?.uid ?? "",
      "sampleRateHz": session.sampleRate,
      "ioBufferDurationMs": session.ioBufferDuration * 1000.0,
      "channels": input?.channels?.count ?? 0,
      "isInputAvailable": input != nil,
      "isBluetoothInput": (input?.portType == .bluetoothHFP || input?.portType == .bluetoothLE)
    ]
    if let e = extra {
      payload["raw"] = ["note": String(describing: e)]
    }
    return payload
  }
}
