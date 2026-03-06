function resolveExpoPreset() {
  try {
    return require.resolve("babel-preset-expo")
  } catch {
    // Fallback when the preset exists only under Expo's nested node_modules.
    return require.resolve("expo/node_modules/babel-preset-expo")
  }
}

module.exports = function (api) {
  api.cache(true)
  return {
    presets: [resolveExpoPreset()],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
          },
        },
      ],
      // NOTE: Expo SDK 54+ (babel-preset-expo) wires up the Worklets/Reanimated transforms.
      // Keep this config lean to avoid duplicate plugin warnings.
    ],
  }
}
