# Store Forms Snapshot (Release Required)

> Paste the **exact** values submitted in:
> - Apple App Privacy
> - Google Play Data Safety
>
> CI can enforce this when `RELEASE=1`.

## Apple App Privacy

- Data Types Collected:
  - **Diagnostics** (Crash Data) — only if the user opts in to crash reporting.
  - Otherwise: **No data collected**.
- Data Linked to You: **No** (crash reports are not tied to identity in-app).
- Tracking: **No**.
- Notes:
  - Practice audio recordings remain **on-device**.
  - If you enable cloud sync in future, update this snapshot and the Truth Table.

## Google Play Data Safety

- Data Collected:
  - **Crash logs** (Diagnostics) — only if the user opts in.
- Data Shared: **None** (no sale or sharing of data).
- Security Practices:
  - Data is transmitted over **encrypted connections** when sent (HTTPS).
  - Users can disable crash reporting (consent gate).
- Notes:
  - Recordings are stored locally in cache unless the product adds an explicit upload feature.

## Truth alignment
This snapshot must match:
- `docs/privacy/TELEMETRY_TRUTH_TABLE.md`
- `docs/privacy/DATA_MAP.md`
