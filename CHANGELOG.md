# Changelog

All notable changes to Bait El-Hakma will be documented in this file.

## [2.8.0] - 2026-08-01

### Added
- **Modern Landing Page Redesigned** — Complete overhaul with split hero layout, animated Islamic geometric background, floating app mockup, bento grid gallery, desktop app showcase section
- **Electron Desktop App for Windows** — Native Windows desktop application with system tray, NSIS installer, and offline support
- **Tab Order Profiles System** — Create, rename, delete, and switch between tab order profiles; profiles persist across sessions
- **Desktop App Banner** — Landing page now showcases the Electron desktop app availability
- **Dedicated UI Storage Key** — Tab preferences (`bait-el-hakma-ui`) stored separately from cloud data to prevent overwrite on sync

### Fixed
- **Tab Profile Persistence** — Profiles no longer reset to "Default" after page refresh; root cause was the main save effect overwriting localStorage on first mount before cloud load could read saved data
- **Pinned Timer Pause/Resume** — `TOGGLE_TIMER` action added to reducer; MiniPlayer dispatches it, PomodoroTimer watches via effect
- **YouTube Sound Links** — 428Hz Focus, Forest Walk, and Library ambient sounds now load correctly
- **Link to Task Dropdown** — Shows Kanban tasks (non-done columns) and todos with proper optgroups
- **FAB Close Button** — QuickCapture expanded card now has an X button to close

### Changed
- **Logo References** — All `/logo.png` references updated to use `public/img/bait-el-hakma%20logo.png`
- **Version bumped to 2.8.0**

## [2.7.0] - 2026-07-31

### Added
- Tab reordering with drag-and-drop (HTML5 native)
- Local audio file upload with native `<audio controls>` and play/pause toggle
- Help Guide section with 12 accordion sections and keyboard shortcuts
- Back-to-top button in Quran section (appears when scrolled >400px)
- Quran Audio play/pause button for uploaded files

### Fixed
- Quran back-to-top button visibility
- Book library CORS workaround for cover images

## [2.6.0] - 2026-07-30

### Added
- Activity Statistics section with charts
- Challenge Tracker with streaks and visual grids
- Daily Notes with Hijri calendar support
- Motivation section with Quran, hadith & daily quotes
- Profile page with public profile URLs (`/@username`)

### Changed
- Migrated to Vite 7 and React 19
- Upgraded TypeScript to 5.9
- Improved cloud sync reliability
