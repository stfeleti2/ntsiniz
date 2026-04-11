"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowScenarioList = exports.flowScenarios = exports.viewportWidths = void 0;
exports.viewportWidths = {
    "phone-sm": 320,
    "phone-lg": 390,
    tablet: 768,
};
exports.flowScenarios = {
    onboarding: {
        id: "onboarding",
        title: "Onboarding Funnel",
        description: "Level selection, permissions primer, and wake-your-voice handoff.",
        startRoute: "Onboarding",
        steps: [
            {
                id: "level",
                title: "Level Selection",
                summary: "Choose singing level and helper density.",
                route: "Onboarding",
            },
            {
                id: "perm",
                title: "Mic Primer",
                summary: "Permission rationale and safe next action.",
                route: "PermissionsPrimer",
                params: { kind: "mic", next: { name: "WakeYourVoice" } },
            },
            {
                id: "wake",
                title: "Wake Voice",
                summary: "Audio readiness and first confidence-building action.",
                route: "WakeYourVoice",
            },
        ],
    },
    signin: {
        id: "signin",
        title: "Sign-In Flow",
        description: "Email OTP request and verification state coverage.",
        startRoute: "SignIn",
        steps: [
            {
                id: "email",
                title: "Email Step",
                summary: "Collect email and request one-time code.",
                route: "SignIn",
            },
            {
                id: "code",
                title: "Code Step",
                summary: "Verify OTP and route back to account.",
                route: "SignIn",
            },
            {
                id: "account",
                title: "Account",
                summary: "Post-auth account experience.",
                route: "Account",
            },
        ],
    },
    "singing-start": {
        id: "singing-start",
        title: "Singing Start Flow",
        description: "Entry points into tuner/drill and first practice loop.",
        startRoute: "MainTabs",
        steps: [
            {
                id: "home",
                title: "Home Entry",
                summary: "Context and CTA into next training action.",
                route: "MainTabs",
            },
            {
                id: "session",
                title: "Session Setup",
                summary: "Pick drill focus and prep state.",
                route: "MainTabs",
            },
            {
                id: "drill",
                title: "Drill Runtime",
                summary: "Live drill state and transition to result.",
                route: "Drill",
                params: { sessionId: "sandbox-session", drillId: "warmup_match_a4" },
            },
        ],
    },
};
exports.flowScenarioList = Object.values(exports.flowScenarios);
