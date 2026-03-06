const { unlockQaMode } = require("./helpers")

describe("Shareables: weekly report + CSV", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  it("shares weekly report and exports CSV without OS share sheet (QA mode)", async () => {
    await unlockQaMode()

    // Create some data
    await element(by.id("tab-Session")).tap()
    await element(by.id("btn-session-start")).tap()
    await element(by.id("btn-drill-start")).tap()
    await element(by.id("btn-drillresult-next")).tap()

    await element(by.id("tab-Journey")).tap()
    await element(by.id("seg-journey-proof")).tap()
    await expect(element(by.text("Weekly report"))).toBeVisible()

    await element(by.id("btn-journey-share-weekly")).tap()
    await expect(element(by.text("Shared ✅"))).toBeVisible()

    await element(by.id("btn-journey-export-csv")).tap()
    await expect(element(by.text("CSV ready ✅"))).toBeVisible()
  })
})
