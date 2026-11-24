# MediMind — AI Medicine Reminder & Prescription Reader

MediMind helps people stay on top of their medicines: it reminds you when a dose is due, reads
prescription photos with AI so you don't have to type everything in by hand, and includes a
built-in chat assistant for quick questions about your schedule.

## What's inside

| Feature | Description |
|---|---|
| **Medicine reminders** | Add medicines with dosage, frequency and one or more reminder times. The dashboard shows today's schedule, highlights doses that are due or overdue, and sends a browser notification when a dose is due. |
| **Prescription reader** | Upload a photo of a prescription. The backend runs OCR (`tesseract.js`) and a parser that guesses medicine name / dosage / frequency. You review and edit every field before anything is saved — nothing is added automatically. Manual entry is always available as an alternative. |
| **AI chatbot** | A floating assistant (bottom-right corner) that can answer questions about your saved medicines and general medicine facts. It never gives dosage changes or diagnoses, and always points you to a doctor/pharmacist for anything specific to your health. |
| **Adherence tracking** | A simple 7-day "% doses taken" stat on the dashboard. |
| **Accounts** | Each user has their own login and their own private medicine list (JWT-based auth). |

## Tech stack

- **Frontend:** React 18 + Vite, React Router, Tailwind CSS, lucide-react icons
- **Backend:** Node.js + Express, JWT auth, bcrypt, multer (file upload), tesseract.js (OCR)
- **Data storage:** plain JSON files (`backend/data/*.json`) — no database server to install.
  This also avoids the native-module compile errors that SQLite-based setups can hit on Windows.
- **AI:** Anthropic Claude API for the chatbot (optional — see below)

## Project structure

```
ai-med-reminder/
├── backend/
│   ├── config/db.js              JSON-file "database" helpers
│   ├── middleware/auth.middleware.js
│   ├── routes/                   auth, medicines, prescriptions, chat
│   ├── utils/prescriptionParser.js
│   ├── data/                     users.json / medicines.json / logs.json (auto-created)
│   ├── uploads/                  temporary prescription images (auto-cleaned)
│   ├── server.js
│   └── .env.example
└── frontend/
    └── src/
        ├── app/                  App.jsx, routing, AuthProvider, global styles
        ├── pages/                LoginPage, RegisterPage, DashboardPage, PrescriptionsPage
        ├── widgets/               Navbar, TodaySchedule, MedicineList, ChatWidget
        ├── features/              AddMedicineModal, PrescriptionScanner
        ├── entities/              medicineApi.js (API calls)
        └── shared/                ui components, api client, date/notification helpers
```

## Prerequisites

- **Node.js 18 or newer** (includes npm). Check with `node -v`.
- An internet connection the first time you install packages (npm needs to download them), and
  the first time OCR runs (tesseract.js downloads its English language data on first use).

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and check the values:

```
PORT=5000
JWT_SECRET=medimind_super_secret_change_me     # change this to any long random string
ANTHROPIC_API_KEY=                             # optional — see "Enabling the AI chatbot" below
ANTHROPIC_MODEL=claude-sonnet-4-6
```

Start the server:

```bash
npm run dev
```

You should see:

```
✅ MediMind API running at http://localhost:5000
```

Leave this terminal running.

## 2. Frontend setup

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Vite will print a local URL, typically:

```
http://localhost:5173
```

Open that in your browser. The dev server automatically forwards any `/api/...` request to the
backend on port 5000 (see `vite.config.js`), so you don't need to configure any URLs by hand.

## 3. Using the app

1. **Register** an account (name, email, password — 6+ characters).
2. On the **Dashboard**, click **Add medicine** to create your first reminder — give it a name,
   dosage, frequency and one or more times of day.
3. Your browser will ask for **notification permission** the first time you load the dashboard.
   Allow it so MediMind can alert you when a dose is due.
4. Go to **Prescriptions** to either:
   - upload a photo and click **Scan with AI** — review/edit the detected medicines, then add the
     ones you want, or
   - use the **Or add manually** form on the right.
5. Click the chat bubble in the bottom-right corner any time to ask the assistant a question.

## Enabling the AI chatbot

The chatbot works out of the box with safe, canned replies. To enable full AI-powered answers:

1. Get an API key from https://console.anthropic.com/
2. Open `backend/.env` and set:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
3. Restart the backend (`npm run dev` in the `backend` folder).

No key? No problem — the app keeps working, the chatbot just tells the user it isn't connected
yet and points them back to the dashboard.

## Troubleshooting

- **"npm install" fails with a compiler/build error on Windows** — this project deliberately
  avoids SQLite and other native-module dependencies for this reason. If you still see a build
  error, delete `node_modules` and `package-lock.json` in the affected folder and run
  `npm install` again.
- **OCR scan is slow the first time** — tesseract.js downloads its language data on first use;
  subsequent scans are much faster.
- **Notifications don't appear** — check your browser's site settings and make sure
  notifications are allowed for `localhost:5173`. Notifications only fire while the dashboard tab
  is open.
- **"Missing authentication token" errors** — your session may have expired; log out and back in.
- **Port already in use** — change `PORT` in `backend/.env`, or stop whatever else is using port
  5000 / 5173.

## Notes on scope

This project is built for demonstration/academic purposes. Before using anything like this for
real medical use, you'd want to add things like: encrypted storage, a real database with backups,
SMS/push notifications (so reminders work when the browser tab is closed), and a licensed
pharmacist/doctor review step for anything the AI assistant surfaces.
