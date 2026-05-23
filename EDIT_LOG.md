# Hexa Relation - Edit Log & Maintenance Tracker

## 🛠 Maintenance Status
- **Current Month:** 2026年5月
- **Free Edits Used:** 1 / 1 (Initial) + 1 (meimei page)
- **Next Reset:** 2026年6月1日

---

## 📝 Change History

### 2026-05-21: Add New Portfolio "meimei"
- **Task:** Create a dedicated portfolio for "meimei" and register to the index.
- **Changes:**
  - Created `save/meimei/index.html` with basic MOTHER2 style.
  - Added "meimei" (no. 002) to the "Save Data List" on the main page.
  - Updated `GEMINI.md` with URL specifications.
  - Fixed HTML syntax errors and restored encounter overlay.
  - Added retro-style click sound (Web Audio API) to the root index.html only.
- **Notes:** This counts as a new client build and integration.

### 2026-05-23: Add New Portfolio "choco"
- **Task:** Create a dedicated LP for "choco" and replace the test save slot.
- **Changes:**
  - Created `save/choco/index.html` with a Chocolate-themed MOTHER2 style.
  - Replaced "SAMPLE HERO" (no. 001) with "CHOCO" in the "Save Data List" within `save/nox/index.html`.
  - Implemented character walking animation for Choco using three-frame sprite cycling.
  - Adjusted Choco's stats (HP: 120, LP: 16) and location ("きりの森").
- **Notes:** The new LP is now accessible via the main portfolio's save list.

### 2026-05-22: Fix Status Popup Alignment on Mobile
- **Task:** Fix the misalignment of the "つよさをみる" (Check Status) popup on mobile devices.
- **Changes:**
  - Added missing CSS for `#details-popup` and `.details-inner` in `save/nox/index.html`.
  - Implemented absolute positioning with centering (`left: 50%; transform: translateX(-50%);`) to ensure the popup is centered regardless of the parent's width.
  - Styled the popup as a MOTHER2-style speech bubble with a red border and a triangle pointer to match the theme.
- **Notes:** The popup is now centered and visually consistent with the rest of the UI.
