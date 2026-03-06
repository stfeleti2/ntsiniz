# Store console setup (Apple + Google + RevenueCat)

## RevenueCat (minimum correct setup)
1. Create a Project.
2. Create an Entitlement: `pro`.
3. Create an Offering: `default`.
4. Add Packages to `default`:
   - `monthly`
   - `annual`

**Exit criteria**
- A sandbox purchase returns `entitlements.pro = true` in the app.
- Restore purchases also restores `pro`.

## Apple App Store Connect (Auto-Renewable Subscriptions)
1. Agreements, Tax, and Banking:
   - Accept the Paid Apps Agreement
   - Complete tax and banking details
2. Create subscription products:
   - Group: `Ntsiniz Pro`
   - Products: monthly + yearly
3. Attach subscriptions to the version you submit for review.
4. Add subscription metadata (display name, description, pricing).

**Testing**
- Use StoreKit sandbox testers.
- Verify purchase + restore.

## Google Play Console (Subscriptions)
1. Set up payments profile / merchant account + tax.
2. Create subscriptions (monthly + yearly).
3. Configure base plan(s) and offers (trial optional).
4. Activate and test with license testers.

## Connect stores → RevenueCat
1. Add App Store credentials + Play store service account to RevenueCat.
2. Map store products to RevenueCat products.
3. Attach mapped products to Offering `default`.

## Screenshots + listing assets
- Prepare:
  - 6–8 screenshots (phone)
  - Optional: 3–5 screenshots (tablet)
  - Short description + full description
  - Keywords (iOS)
  - Feature graphic (Android)
- Ensure screenshots match the Store Build surface (no hidden/unfinished tabs).
