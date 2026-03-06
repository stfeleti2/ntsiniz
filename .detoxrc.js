/**
 * Detox E2E config
 *
 * Notes:
 * - Works best with **prebuilt** native projects (Expo prebuild).
 * - If your iOS scheme / workspace names differ, update the xcodebuild command.
 * - Permissions via `device.launchApp({ permissions: ... })` are **iOS simulator only**.
 */

module.exports = {
  testRunner: "jest",
  runnerConfig: "e2e/jest.config.js",
  specs: "e2e/**/*.e2e.js",
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/Ntsiniz.app",
      build:
        'xcodebuild -workspace ios/Ntsiniz.xcworkspace -scheme Ntsiniz -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build: "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 14",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_6_API_34",
      },
    },
  },
  configurations: {
    "ios.sim.debug": {
      device: "simulator",
      app: "ios.debug",
    },
    "android.emu.debug": {
      device: "emulator",
      app: "android.debug",
    },
  },
}
