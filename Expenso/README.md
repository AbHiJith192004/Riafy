# Expenso

Expenso is a local personal expense tracker built with Node.js, Express, SQLite, and vanilla HTML/CSS/JavaScript. It runs end-to-end with one command after installing dependencies.

## How to Run

```bash
npm install
node server.js
```

Open `http://localhost:3000` in your browser.

## UI Overview

The app opens directly into a responsive dashboard. The top bar shows the Expenso brand, today's date, and a `+` action for opening the entry panel. On desktop, the page uses a two-column layout: the left sidebar contains the current month summary, while the right panel contains filters and the expense list. On mobile, the layout stacks into one column and the filter bar becomes a collapsible panel.

The monthly summary card shows the current month total, a progress divider, and category rows with matching color dots, amounts, and proportion bars. Expense rows include a category dot, title, note, formatted date, category badge, amount, edit action, and inline delete confirmation.

## Project Structure

```text
expense-tracker/
|-- server.js                 # Thin app entry point
|-- database.js               # Compatibility export for the SQLite connection
|-- src/
|   |-- app.js                # Express app wiring
|   |-- config/               # Shared constants such as categories
|   |-- controllers/          # Request handlers and response shaping
|   |-- db/                   # SQLite connection and schema setup
|   |-- middleware/           # Request logging, 404, and error handling
|   |-- repositories/         # Database queries
|   |-- routes/               # API route definitions
|   |-- utils/                # Logger, dates, async helpers
|   `-- validators/           # Payload, filter, and id validation
|-- public/
|   |-- index.html
|   |-- style.css
|   |-- app.js
|   `-- assets/
|       `-- app-icon.png
|-- package.json
`-- README.md
```

This keeps each responsibility in its own folder so new teammates can work on validation, database queries, API handlers, or middleware without digging through one large server file.

## Terminal Logs

The server prints structured logs directly in the terminal. You will see:

- Database initialization.
- Server startup URL and port.
- Every request start and completion with method, path, status, and duration.
- Validation failures with field-level errors.
- Expense create, update, delete, list, and summary actions.
- API 404s and unexpected server errors.

Example:

```text
[2026-06-02T06:10:00.000Z] [INFO] Request started {"method":"GET","path":"/api/expenses","ip":"::1"}
[2026-06-02T06:10:00.012Z] [INFO] Expenses fetched {"count":0,"filters":{"category":"","from":"","to":"","title":""}}
[2026-06-02T06:10:00.014Z] [INFO] Request completed {"method":"GET","path":"/api/expenses","status":200,"durationMs":14.2}
```

## Stack Choices and Tradeoffs

- `better-sqlite3` keeps local persistence simple, fast, and synchronous for this small app.
- Express provides a compact JSON API with clear REST endpoints.
- Vanilla frontend code keeps the project dependency-light and easy to inspect.
- The UI uses Google Fonts, CSS custom properties, Grid, Flexbox, and subtle transitions for a polished dashboard.
- All mutations re-fetch expenses and summary so the database remains the single source of truth.

## API

- `GET /api/expenses` returns all expenses sorted by date descending. Query params: `category`, `from`, `to`, `title`.
- `POST /api/expenses` creates an expense.
- `PUT /api/expenses/:id` updates an expense.
- `DELETE /api/expenses/:id` deletes an expense.
- `GET /api/summary` returns the current month total and per-category breakdown.

## What's Done

- SQLite `expenses` table with validation constraints.
- Full CRUD API with `400`, `404`, `201`, and `200` responses.
- Current-month summary endpoint.
- Clean modular backend folders for team collaboration.
- Structured terminal logs for all API activity and important app events.
- Optional camera/gallery bill image attachment for each expense.
- Browser-side bill text scanning with Tesseract.js, scanned text storage, and autofill suggestions.
- Skippable first-run product tour for new users.
- Responsive two-column desktop and single-column mobile UI.
- Consistent category colors across badges, dots, bars, and borders.
- Add/edit entry panel, cancel edit, delete with inline confirmation, filters, empty states, validation hints, and toast notifications.
- Indian currency formatting such as `INR 1,00,000.00` in supported browsers.

## What's Skipped

- User accounts and authentication.
- Multi-currency support.
- Data export/import.
- Recurring expense automation.

## Known Rough Edges

- The app is designed for local single-user use, so there is no concurrency control beyond SQLite's normal behavior.
- Summary always reflects the current calendar month from the server runtime.
- The search filter matches expense titles only, not notes.
