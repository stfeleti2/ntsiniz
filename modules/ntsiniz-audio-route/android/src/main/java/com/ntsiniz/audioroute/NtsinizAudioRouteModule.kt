package com.ntsiniz.audioroute

import android.content.Context
import android.media.AudioDeviceCallback
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.events.EventEmitter

class NtsinizAudioRouteModule : Module() {
  private var audioManager: AudioManager? = null
  private var deviceCallback: AudioDeviceCallback? = null

  override fun definition() = ModuleDefinition {
    Name("NtsinizAudioRoute")
    Events("routeChanged", "interruption")

    AsyncFunction("getCurrentRoute") {
      ensureAudioManager()
      currentRouteInfo()
    }

    AsyncFunction("listInputs") {
      ensureAudioManager()
      listInputDevices()
    }

    AsyncFunction("setPreferredInput") { uid: String? ->
      // Best-effort: Only supported reliably on API 31+ via setCommunicationDevice.
      ensureAudioManager()
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val devs = audioManager!!.availableCommunicationDevices
        if (uid == null) {
          audioManager!!.clearCommunicationDevice()
          return@AsyncFunction true
        }
        val match = devs.firstOrNull { it.id.toString() == uid }
        if (match != null) {
          return@AsyncFunction audioManager!!.setCommunicationDevice(match)
        }
      }
      false
    }

    AsyncFunction("configureVocalCapture") { config: Map<String, Any> ->
      ensureAudioManager()
      val allowBluetooth = config["allowBluetooth"] as? Boolean ?: true
      // For voice capture we prefer MODE_IN_COMMUNICATION to improve mic path consistency.
      audioManager!!.mode = AudioManager.MODE_IN_COMMUNICATION
      // Bluetooth SCO can be requested; many devices require it for BT mic input.
      if (allowBluetooth) {
        try {
          audioManager!!.startBluetoothSco()
          audioManager!!.isBluetoothScoOn = true
        } catch (_: Throwable) {}
      } else {
        try {
          audioManager!!.stopBluetoothSco()
          audioManager!!.isBluetoothScoOn = false
        } catch (_: Throwable) {}
      }
    }

    OnStartObserving {
      ensureAudioManager()
      startDeviceObserving()
    }

    OnStopObserving {
      stopDeviceObserving()
    }
  }

  private fun ensureAudioManager() {
    if (audioManager == null) {
      val ctx = appContext.reactContext ?: throw IllegalStateException("No react context")
      audioManager = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    }
  }

  private fun startDeviceObserving() {
    if (deviceCallback != null) return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      deviceCallback = object : AudioDeviceCallback() {
        override fun onAudioDevicesAdded(addedDevices: Array<AudioDeviceInfo>) {
          sendEvent("routeChanged", currentRouteInfo(mapOf("change" to "added")))
        }
        override fun onAudioDevicesRemoved(removedDevices: Array<AudioDeviceInfo>) {
          sendEvent("routeChanged", currentRouteInfo(mapOf("change" to "removed")))
        }
      }
      audioManager!!.registerAudioDeviceCallback(deviceCallback, null)
    }
  }

  private fun stopDeviceObserving() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      if (deviceCallback != null) {
        audioManager!!.unregisterAudioDeviceCallback(deviceCallback)
      }
    }
    deviceCallback = null
  }

  private fun listInputDevices(): List<Map<String, Any?>> {
    val am = audioManager!!
    val devices = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      am.getDevices(AudioManager.GET_DEVICES_INPUTS).toList()
    } else {
      emptyList()
    }
    return devices.map { d ->
      mapOf(
        "routeType" to routeType(d),
        "inputName" to (d.productName?.toString() ?: ""),
        "inputUid" to d.id.toString(),
        "isBluetoothInput" to (d.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO),
        "raw" to mapOf("type" to d.type, "address" to d.address)
      )
    }
  }

  private fun currentRouteInfo(extra: Map<String, Any?>? = null): Map<String, Any?> {
    val am = audioManager!!
    var routeType = "unknown"
    var name = ""
    var uid = ""
    var isBluetooth = false

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val dev = am.communicationDevice
      if (dev != null) {
        routeType = routeType(dev)
        name = dev.productName?.toString() ?: ""
        uid = dev.id.toString()
        isBluetooth = dev.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
      }
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      // Best effort: pick first connected input preference order.
      val inputs = am.getDevices(AudioManager.GET_DEVICES_INPUTS)
      val preferred = inputs.firstOrNull { it.type == AudioDeviceInfo.TYPE_WIRED_HEADSET || it.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES }
        ?: inputs.firstOrNull { it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO }
        ?: inputs.firstOrNull { it.type == AudioDeviceInfo.TYPE_BUILTIN_MIC }
      if (preferred != null) {
        routeType = routeType(preferred)
        name = preferred.productName?.toString() ?: ""
        uid = preferred.id.toString()
        isBluetooth = preferred.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
      }
    }

    val payload = mutableMapOf<String, Any?>(
      "routeType" to routeType,
      "inputName" to name,
      "inputUid" to uid,
      "isBluetoothInput" to isBluetooth,
      "raw" to (extra ?: emptyMap<String, Any?>())
    )
    return payload
  }

  private fun routeType(d: AudioDeviceInfo): String {
    return when (d.type) {
      AudioDeviceInfo.TYPE_BUILTIN_MIC -> "built_in_mic"
      AudioDeviceInfo.TYPE_WIRED_HEADSET, AudioDeviceInfo.TYPE_WIRED_HEADPHONES -> "wired_headset"
      AudioDeviceInfo.TYPE_BLUETOOTH_SCO -> "bluetooth_sco"
      AudioDeviceInfo.TYPE_BLUETOOTH_A2DP -> "bluetooth_a2dp"
      else -> "unknown"
    }
  }

  private fun sendEvent(name: String, payload: Any?) {
    appContext.eventEmitter?.emit(name, payload)
  }
}
