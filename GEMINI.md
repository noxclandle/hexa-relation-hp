# Hexa Relation Project Mandates

## 1. Design & Architecture
- **Mobile-First Priority:** All layouts and gimmicks must be optimized for vertical smartphone screens.
- **PC Responsiveness:** Ensure content is centered and readable on larger screens (max-w-2xl style).
- **MOTHER2 Aesthetic:** Maintain the retro-RPG style (black background, red/white double borders, pixel fonts) for all future components.

## 2. Maintenance & Operation Policy
- **Monthly Free Edit:** Every client request is entitled to one free edit per month.
- **Edit Tracking:** Implement a counting/logging mechanism to track the number of edits performed for each request within a calendar month.
- **Service Standard:** All updates must be completed within 24 hours of a valid request.

## 3. Logging Requirements
- **Change Log:** Every modification to the codebase or content must be recorded with a date and description.
- **Backup:** Before any significant structural rewrite, ensure a backup or a clear version history is maintained.

---

## 4. Portfolio & URL Specifications
- **Client URL Structure:** Use a sub-directory format based on the "Save Data" concept: `hexa-relation.com/save/[unique_id]`.
- **Title Naming Convention:** All portfolio pages MUST follow the format: `<NAME> - Portfolio (<THEME>風)`.
- **Mandatory Analytics & Logging:** Every LP must implement Firebase-based hit counting and referrer logging (Visitor Log).
- **Automated Sync:** After creating or modifying an LP, `scripts/sync_portfolios.js` MUST be executed to synchronize the admin console and public index.
- **Mobile-First Standard:** 100% responsiveness on vertical smartphone screens is mandatory.
- **Interactive Gimmicks:** Every LP should feature between 3 to 10 game-like interactive elements (e.g., Dialogue, Loot, Quest, etc.).
- **Thematic Flexibility:** While the main site is MOTHER2-themed, individual portfolio pages (`/save/*`) must be styled according to the client's preferred game world (e.g., Pokemon, DQ, Fighting games, etc.).

---

## 5. Current Progress & Features
- Single-page MOTHER2 style portfolio (Main).
- Theme switching system (Red/Blue) with `localStorage` persistence.
- Nested command menu for service navigation.
- DVD-style bouncing fox gimmick.
- "Detailed Status" speech bubble popup.
- Automated Portfolio Sync script (`scripts/sync_portfolios.js`).
- Admin Console with real-time analytics and sorting.
