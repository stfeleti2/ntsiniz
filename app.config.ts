import type { ExpoConfig, ConfigContext } from "@expo/config"

export default ({ config }: ConfigContext): ExpoConfig => {
  const storeBuild = (process.env.STORE_BUILD ?? '') === 'true' || (config.extra as any)?.storeBuild === true

  const plugins = config.plugins ?? []
  // Optional: enable Sentry native init + sourcemap upload in EAS builds when env is present.
  if (process.env.SENTRY_AUTH_TOKEN) {
    plugins.push([
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        // Native init is safest for production builds.
        useNativeInit: true,
      },
    ])
  }

  return {
    ...config,
    name: config.name ?? "Ntsiniz",
    slug: config.slug ?? "ntsiniz",
    // Deep links (share/import). Example: ntsiniz://import?code=...
    scheme: config.scheme ?? "ntsiniz",
    version: config.version ?? "0.1.0",
    // Store-ready OTA updates + consistent native/runtime compatibility.
    updates: {
      url: (config.updates as any)?.url,
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    orientation: "portrait",
    icon: config.icon ?? "./assets/brand/icon.png",
    splash: {
      image: "./assets/brand/splash.png",
      resizeMode: "contain",
      backgroundColor: "#080A12",
    },
    ios: {
      ...config.ios,
      bundleIdentifier: config.ios?.bundleIdentifier ?? "com.ntsiniz.app",
      // Required for App Store submissions / updates.
      buildNumber: String((config.ios as any)?.buildNumber ?? process.env.IOS_BUILD_NUMBER ?? "1"),
      supportsTablet: true,
      icon: config.ios?.icon ?? "./assets/brand/icon.png",
      // Apple Privacy Manifest (Required Reason APIs). Keep minimal and expand based on App Store feedback.
      // See Expo guide: https://docs.expo.dev/guides/apple-privacy/
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
          },
        ],
      },
      infoPlist: {
        ...(config.ios?.infoPlist ?? {}),
        NSMicrophoneUsageDescription:
          "We use your microphone to detect pitch for real-time vocal training.",
        ...(storeBuild
          ? {}
          : {
              NSCameraUsageDescription: "We use your camera to record short performance clips you can share.",
              NSPhotoLibraryAddUsageDescription:
                "We save your performance clips to your photo library when you choose to export.",
            }),
      },
    },
    android: {
      ...config.android,
      package: config.android?.package ?? "com.ntsiniz.app",
      // Required for Play Store submissions / updates.
      versionCode: Number((config.android as any)?.versionCode ?? process.env.ANDROID_VERSION_CODE ?? 1),
      adaptiveIcon: {
        foregroundImage: "./assets/brand/adaptive-foreground.png",
        backgroundColor: "#080A12",
      },
      notification: {
        icon: "./assets/brand/notification-icon.png",
        color: "#37F2C6",
      },
      permissions: [
        "RECORD_AUDIO",
        "POST_NOTIFICATIONS",
        ...(storeBuild
          ? []
          : [
              "CAMERA",
              // Media library (Android 13+)
              "READ_MEDIA_IMAGES",
              "READ_MEDIA_VIDEO",
            ]),
      ],
    },
    web: {
      ...config.web,
      favicon: (config.web as any)?.favicon ?? "./assets/brand/favicon.png",
    },
    extra: {
      ...(config.extra ?? {}),
      // Optional. If not set, Sentry is disabled.
      // Recommended to set via environment variables (EAS secrets / CI).
      sentryDsn: process.env.SENTRY_DSN ?? (config.extra as any)?.sentryDsn ?? "",
      sentryEnv: process.env.SENTRY_ENV ?? (config.extra as any)?.sentryEnv ?? "",
      sentryEnableInDev: (process.env.SENTRY_ENABLE_IN_DEV ?? "") === "true" || (config.extra as any)?.sentryEnableInDev === true,
      sentryTracesSampleRate:
        process.env.SENTRY_TRACES_SAMPLE_RATE != null && process.env.SENTRY_TRACES_SAMPLE_RATE !== ""
          ? Number(process.env.SENTRY_TRACES_SAMPLE_RATE)
          : (config.extra as any)?.sentryTracesSampleRate ?? 0,
      revenuecatIosApiKey: process.env.REVENUECAT_IOS_API_KEY ?? (config.extra as any)?.revenuecatIosApiKey ?? '',
      revenuecatAndroidApiKey: process.env.REVENUECAT_ANDROID_API_KEY ?? (config.extra as any)?.revenuecatAndroidApiKey ?? '',
      revenuecatEntitlementPro: process.env.REVENUECAT_ENTITLEMENT_PRO ?? (config.extra as any)?.revenuecatEntitlementPro ?? 'pro',
      supabaseUrl: process.env.SUPABASE_URL ?? (config.extra as any)?.supabaseUrl ?? '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? (config.extra as any)?.supabaseAnonKey ?? '',
      cloudAutoSync: (process.env.CLOUD_AUTO_SYNC ?? '') !== 'false' && ((config.extra as any)?.cloudAutoSync ?? true),
      // Store listing metadata
      storeListingTitle: (config.extra as any)?.storeListingTitle ?? "Ntsiniz",
      storeListingDescription:
        (config.extra as any)?.storeListingDescription ?? "Sing with a Ghost Guide. Train pitch, timing, and confidence.",
      storeListingKeywords:
        (config.extra as any)?.storeListingKeywords ?? "singing, vocal training, pitch, tuner, ear training, karaoke, music, practice",
      storeDescription:
        (config.extra as any)?.storeDescription ??
        "Train your voice with clarity, not anxiety.\n\nNtsiniz helps you sing in tune and on time using a beautiful Aurora Ghost Guide that makes practice feel like a game.\n\nHow it works:\n1) Pick a drill or program day.\n2) Sing along with the Ghost Guide lane.\n3) Get a simple phrase grade (Perfect / Clean / Almost) and a clear \"What now?\" fix.\n\nBuilt for real progress:\n- Targeted drills for pitch stability, intervals, resonance, vibrato, agility\n- Explainable grading and next-step coaching\n- A calm, modern neumorphic UI that keeps you moving forward\n\nOptional Pro:\nUnlock advanced Ghost Guide insights and premium training content. Cancel anytime.",
      supportUrl: (config.extra as any)?.supportUrl ?? "https://ntsiniz.com/support",
      category: (config.extra as any)?.category ?? "Music",
      contentRating: (config.extra as any)?.contentRating ?? 4,
      // Store links (replace with your hosted URLs before submission)
      termsUrl: process.env.TERMS_URL ?? (config.extra as any)?.termsUrl ?? "https://ntsiniz.com/terms",
      privacyUrl: process.env.PRIVACY_URL ?? (config.extra as any)?.privacyUrl ?? "https://ntsiniz.com/privacy",
      publicAppUrl: process.env.PUBLIC_APP_URL ?? (config.extra as any)?.publicAppUrl ?? "https://ntsiniz.com/app",
      publicInviteUrlBase: process.env.PUBLIC_INVITE_URL_BASE ?? (config.extra as any)?.publicInviteUrlBase ?? "https://ntsiniz.com/invite",
      // When true, app hides unfinished Phase 2+ surfaces.
      storeBuild,
    },
    plugins: [
      ...plugins,
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "16.0",
          },
        },
      ],
      "expo-stream-audio",
      "expo-notifications",
      // Phase 1 store build is audio-first: exclude camera/media plugins to reduce review risk + bundle.
      ...(storeBuild ? [] : ["expo-camera", "expo-media-library"]),
    ],
  }
}
