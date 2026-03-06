const { unlockQaMode } = require("./helpers")

describe("Smoke: session → 3 drills → results", () => {
  beforeAll(async () => {
    const platform = device.getPlatform()
    const cfg = { newInstance: true }
    // iOS simulator only: set runtime permissions before launch.
    if (platform === "ios") {
      cfg.permissions = { microphone: "YES" }
    }
    await device.launchApp(cfg)
  })

  it("completes 3 drills and shares the session report", async () => {
    await unlockQaMode()

    await element(by.id("tab-Session")).tap()
    await element(by.id("btn-session-start")).tap()

    // Drill 1
    await element(by.id("btn-drill-start")).tap()
    await expect(element(by.id("btn-drillresult-share"))).toBeVisible()
    await element(by.id("btn-drillresult-next")).tap()

    // Drill 2
    await element(by.id("btn-drill-start")).tap()
    await expect(element(by.id("btn-drillresult-share"))).toBeVisible()
    await element(by.id("btn-drillresult-next")).tap()

    // Drill 3
    await element(by.id("btn-drill-start")).tap()
    await expect(element(by.id("btn-drillresult-share"))).toBeVisible()
    await element(by.id("btn-drillresult-next")).tap()

    // Results
    await expect(element(by.text("Session Result"))).toBeVisible()
    await element(by.id("btn-results-share")).tap()
    await expect(element(by.text("Shared ✅"))).toBeVisible()

    // Persistence sanity: restart and check Journey proof screen still renders
    await device.terminateApp()
    await device.launchApp({ newInstance: false })
    await element(by.id("tab-Journey")).tap()
    await element(by.id("seg-journey-proof")).tap()
    await expect(element(by.text("Weekly report"))).toBeVisible()
  })
})
