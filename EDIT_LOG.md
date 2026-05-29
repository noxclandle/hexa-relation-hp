# Hexa Relation - Edit Log & Maintenance Tracker

## 🛠 Maintenance Status
- **Current Month:** 2026年5月
- **Free Edits Used:** 1 / 1 (Initial) + 1 (meimei page)
- **Next Reset:** 2026年6月1日

---

## 📝 Change History

### 2026-05-29: 7ch LP Reconstruction (Chrono Trigger x Mahjong)
- **Task:** Rebuild the 7ch LP with a high-conversion design based on PASONA law and Chrono Trigger theme.
- **Changes:**
  - **Design & Copy:** Implemented PASONA-based copywriting ("Chrono Tactics") focusing on Mahjong logic and quantified achievements (Tenhou 7-dan, Stable Rank 8.2).
  - **Interactive Gimmicks:**
    - **Time Warp:** Smoothed transition effect for navigation.
    - **Active Time Battle (ATB):** Pulsing thinking time gauge.
    - **Mahjong Quiz:** Interactive "Nani-kiru?" (What to discard?) training with feedback.
    - **Dialogue Box:** CT-style interactive profile introduction.
    - **Epoch (Sylbird) Button:** Quick scroll-to-top with warp effect.
  - **Logic:** Integrated Firebase tracking for hits and visitor logs.
  - **Sync:** Updated `scripts/sync_portfolios.js` to support "クロノトリガー風" and synchronized indices.
- **Notes:** Transformed a thin portfolio into a highly engaging, conversion-oriented "Battle" LP.

### 2026-05-28: Sabanomiso Scoreboard Name Limit Update
- **Task:** Increase the character limit for the high score name entry from 3 to 10.
- **Changes:**
  - Updated `save/sabanomiso/index.html` CSS: Scaled down `retro-char` size to fit 10 characters.
  - Updated `save/sabanomiso/index.html` HTML: Added 10 character slots to the name entry overlay.
  - Updated `save/sabanomiso/index.html` JS: Modified entry logic to handle 10 characters and allow alphanumeric + spaces.
  - Increased leaderboard container width to 400px to accommodate longer names.
- **Notes:** Improved usability for users with longer handles.

### 2026-05-28: Request Fee Update (30,000 ~ 100,000)
- **Task:** Update the production fee from ¥20,000 to ¥30,000 across the site and portfolio pages.
- **Changes:**
  - Updated `save/nox/index.html` (Main Portfolio Hub) pricing to ¥30,000 〜 ¥100,000.
  - Updated `intro/index.html` and `intro/vtuber/index.html` pricing to ¥30,000 ~.
  - Updated `save/choco/index.html` base pricing to ¥30,000 〜.
  - Executed `scripts/sync_portfolios.js` to synchronize indices.
- **Notes:** Standardized the minimum request fee to 30,000 yen as requested.

### 2026-05-27: Sabanomiso LP Readability & Worldview Update
- **Task:** Improve visibility, mobile optimization, and enhance DBD-themed interactive elements.
- **Changes:**
  - **Readability:** Adjusted text colors (text-gray-300) and removed excessive opacity for better contrast on dark backgrounds.
  - **Mobile Optimization:** Scaled down horror fonts and optimized padding/margins for vertical smartphone screens.
  - **LIVE Status:** Added a red pulsing "🔴 ON AIR" badge linked to YouTube Live.
  - **DBD Worldview:** 
    - Redesigned "THE ARSENAL" icons into a diamond Perk-style UI.
    - Added a "Hex Totem" SVG element with a horror scream effect (Web Audio API) and visual curse.
    - Implemented Konami Code (`↑↑↓↓`) for instant generator repair visual/sound effect.
  - **Interactive:** Added pulse animations and refined transition timings.
- **Notes:** This update addresses usability issues while deepening the thematic immersion. Counts as the free monthly edit refinement.

### 2026-05-27: Restore Admin Access Gimmick
- **Task:** Restore the A-C-E sequential clicking gimmick on the gateway page.
- **Changes:**
  - Replaced keydown-based access with the original character-clicking script in `index.html`.
  - Executed `scripts/sync_portfolios.js` to synchronize indices and update `sitemap.xml`.
- **Notes:** Fixed the issue where smartphone users could not access the admin room.

### 2026-05-21: Add New Portfolio "meimei"
- **Task:** Create a dedicated portfolio for "meimei" and register to the index.
- **Changes:**
  - Created `save/meimei/index.html` with basic MOTHER2 style.
  - Added "meimei" (no. 002) to the "Save Data List" on the main page.
  - Updated `GEMINI.md` with URL specifications.
  - Fixed HTML syntax errors and restored encounter overlay.
  - Added retro-style click sound (Web Audio API) to the root index.html only.
- **Notes:** This counts as a new client build and integration.

### 2026-05-25: Add New Portfolio "sabanomiso"
- **Task:** Create a dedicated LP for "さばのみそ" with a DBD (Dead by Daylight) horror theme and professional branding.
- **Changes:**
  - Created `save/sabanomiso/index.html` with a dark horror aesthetic (fog effect, custom fonts).
  - Integrated detailed career history: Cosmetics company -> Carpenter -> Independent Entrepreneur (8th year).
  - Listed elite qualifications: 1st Class Architect, Formwork Master, Bookkeeping Lvl 1.
  - Added "Mission / Recruit" section for Athletics coaching, Construction recruitment, and Streaming.
  - Implemented 3 Easter eggs:
    - **Portrait Flash:** Click portrait 5 times for Entity's intervention.
    - **Cursed Totem:** Click "Hex: Totem" for a full-screen horror effect and hidden message.
    - **Konami Code:** Input `↑↑↓↓` for instant generator repair.
  - DBD-specific interactive gimmicks: Skill Check Challenge, Generator Repair (Hold-to-progress).
  - Integrated contact email: weicengsabano@gmail.com.
  - Updated `scripts/sync_portfolios.js` for "DBD風" support and synchronized indices.
- **Notes:** Balanced professional recruitment with game-themed entertainment. 3rd client build.

### 2026-05-24: Add New Portfolio "ten"
- **Task:** Create a dedicated LP for "ten" with FF14 (Housing) and FF7 (Easter Egg) themes.
- **Changes:**
  - Created `save/ten/` directory.
  - Initialized `save/ten/index.html` with FF14 "Cute House" concept.
  - Planned FF7 style-swap Easter Egg.
  - **Optimization:** Deleted unused 50MB+ of original PNGs and redundant files.
  - **Optimization:** Resized and compressed all 11 used images (1500px -> 800px, quality 75%).
  - **Optimization:** Compressed BGM (14MB MP3 -> 5.7MB M4A) and updated HTML.
- **Notes:** Total directory size reduced from 68MB to 6.8MB (90% reduction). Sync script executed.

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
