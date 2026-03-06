async function unlockQaMode() {
  // Tap the title 7× to reveal the QA shortcut.
  for (let i = 0; i < 7; i++) {
    await element(by.id("tap-welcome-title")).tap()
  }
  await element(by.id("btn-qa-skip-calibration")).tap()
}

module.exports = { unlockQaMode }
