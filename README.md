# CareCompanion Recovery Tracker

A full-stack recovery tracker web app with backend and SQLite database support.

## Files

- `index.html` - landing page and recovery tracker interface
- `styles.css` - responsive visual design
- `app.js` - frontend API integration and report generation
- `server.js` - Express backend and SQLite database connection
- `package.json` - Node.js dependencies and start script
- `.gitignore` - ignores `node_modules` and the local database file

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

## Features

- Daily recovery log stored in SQLite
- Backend API for entries and report support
- Structured recovery summary for clinician review
- Copyable recovery report text

## Notes

- Data is persisted in `data.db`.
- The server serves the static frontend and handles API requests.
