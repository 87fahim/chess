# ChessApp

A full-stack chess application with user authentication, a React chessboard interface, and an AI opponent powered by the Stockfish engine.

---

## Features

- User registration, login, and JWT-based authentication (access token + HttpOnly refresh cookie)
- Interactive chessboard with drag-and-drop piece movement
- Move list, game controls (undo, reset, flip board), and board/piece colour customisation
- Free-style board editor with FEN support
- AI move suggestions and engine-vs-player mode via Stockfish (UCI protocol over `child_process.spawn`)
- Dark/light theme support

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, chess.js |
| Backend | Node.js, Express, MongoDB (Mongoose / native driver) |
| Auth | JWT (access + refresh tokens), bcrypt, HttpOnly cookies |
| Chess engine | Stockfish (native binary, UCI) |

---

## Prerequisites

| Requirement | Version / Notes |
|-------------|----------------|
| Node.js | 18 LTS or newer |
| npm | 9+ (bundled with Node) |
| MongoDB | Atlas cluster **or** local `mongod` on port 27017 |
| Stockfish binary | **17** or any recent release — see section below |

---

## Stockfish Engine Setup

The server communicates with Stockfish by spawning it as a child process over stdin/stdout (UCI protocol). You must download the binary separately.

### 1 — Download Stockfish

Go to https://stockfishchess.org/download/ and download the build that matches your OS and CPU.

| Platform | Recommended build |
|----------|--------------------|
| Windows x86-64 (AVX2 – most modern CPUs) | `stockfish-windows-x86-64-avx2.exe` |
| Windows x86-64 (older CPUs, no AVX2) | `stockfish-windows-x86-64.exe` |
| macOS (Apple Silicon) | `stockfish-macos-m1-apple-silicon` |
| macOS (Intel) | `stockfish-macos-x86-64-modern` |
| Linux x86-64 | `stockfish-ubuntu-x86-64-avx2` |

> Not sure which build your CPU supports? Run the AVX2 build first — if it crashes immediately, fall back to the plain `x86-64` build.

### 2 — Place the binary

Put the binary anywhere on your machine. A recommended location is inside the server folder:

```
chess/server/stockfishengin/stockfish-windows-x86-64-avx2.exe   ← Windows example
chess/server/stockfishengin/stockfish-macos-m1-apple-silicon     ← macOS example
```

### 3 — Set STOCKFISH_PATH in config.env

Copy `chess/server/config.env.example` to `chess/server/config.env` and set `STOCKFISH_PATH` to the **absolute path** of the binary.

**Windows**
```env
STOCKFISH_PATH=C:/Users/YourName/Desktop/ChessApp/chess/server/stockfishengin/stockfish-windows-x86-64-avx2.exe
```

**macOS / Linux**
```env
STOCKFISH_PATH=/home/yourname/ChessApp/chess/server/stockfishengin/stockfish-ubuntu-x86-64-avx2
```

> On macOS you may need to allow the binary under **System Settings → Privacy & Security → Allow Anyway** the first time it runs.

> On Linux, make the file executable first:
> ```bash
> chmod +x chess/server/stockfishengin/stockfish-ubuntu-x86-64-avx2
> ```

If `STOCKFISH_PATH` is omitted, the server falls back to finding `stockfish` on your system `PATH`. You can install it globally:
```bash
# macOS
brew install stockfish

# Ubuntu / Debian
sudo apt install stockfish
```

---

## Environment Variables

Create `chess/server/config.env` from `chess/server/config.env.example` (never commit this file):

```env
# MongoDB connection string (Atlas or local)
ATLAS_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/ChessApp?retryWrites=true&w=majority

# Local MongoDB fallback
MONGODB_URI=mongodb://localhost:27017/chessapp

# Database name
MONGODB_DB_NAME=chessapp

# JWT secrets — use long random strings in production
JWT_SECRET=replace_with_a_strong_random_secret
JWT_REFRESH_SECRET=replace_with_another_strong_random_secret

# Server port
PORT=5050

# Frontend origin for CORS/cookies
CLIENT_ORIGIN=http://localhost:5173

# Absolute path to the Stockfish binary
STOCKFISH_PATH=C:/absolute/path/to/stockfish.exe
```

Optional client override:

```env
# chess/client/.env
VITE_API_BASE_URL=http://localhost:5050
```

If `chess/server/config.env` was ever committed, remove it from git tracking and rotate the exposed secrets immediately:

```bash
git rm --cached chess/server/config.env
```

---

## Installation & Running

### 1 — Install dependencies

From the repository root:

```powershell
npm install
npm run install:all
```

Or install per app if you prefer manual setup:

```powershell
# Backend
cd chess/server
npm install

# Frontend
cd chess/client
npm install
```

### 2 — Start the backend

From the repository root:

```powershell
npm run dev:server
```

Or manually:

```powershell
cd chess/server
node server.js
# Server listens on http://localhost:5050
```

### 3 — Start the frontend

From the repository root:

```powershell
npm run dev:client
```

Or manually:

```powershell
cd chess/client
npm run dev
# Vite dev server at http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login — returns access token and sets HttpOnly refresh cookie |
| GET | `/me` | Get the currently authenticated user |
| POST | `/refresh` | Exchange refresh cookie for a new access token |
| POST | `/logout` | Clear the refresh token cookie |

### Chess — `/api/chess`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/next-move` | Ask Stockfish for the best move for a given FEN position |

**Request body for `/api/chess/next-move`:**
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "movetime": 2000,
  "depth": 15
}
```
`movetime` (ms) and `depth` are both optional; if `depth` is provided it takes precedence over `movetime`.

---

## Project Structure

```
ChessApp/
├── package.json                  # Root workspace scripts for client/server
├── README.md
chess/
├── client/                      # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── chess/           # Chessboard, controls, move list, engine UI
│       │   ├── login/
│       │   ├── register/
│       │   ├── navbar/
│       │   └── ...
│       └── hooks/
└── server/                      # Express backend
    ├── server.js
    ├── config.env               # ← environment variables (not committed)
    ├── controllers/
    │   ├── authController.js
    │   └── chessController.js   # Stockfish spawn + UCI communication
    ├── routes/
    │   ├── auth.js
    │   └── chess.js
    ├── middleware/
    │   └── auth.js              # JWT verification (Bearer + cookie)
    ├── models/
    │   └── userModel.js
    └── stockfishengin/          # ← place your Stockfish binary here
```

  Notes:

  - The active app packages are only `chess/client` and `chess/server`.
  - The repo root now acts as a lightweight npm workspace wrapper for those two packages.

---

## Running Tests

```powershell
cd chess/client
npm test
```

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `Failed to start Stockfish` | Check that `STOCKFISH_PATH` in `config.env` points to the correct absolute path and the file exists |
| `Stockfish timed out` | Try a lower `depth` value, or verify the binary architecture matches your CPU |
| CORS error in browser | Ensure the frontend runs on `http://localhost:5173` and backend on `http://localhost:5050` |
| MongoDB connection refused | Verify `ATLAS_URI` / `MONGODB_URI` in `config.env` and that your IP is whitelisted in Atlas |
| JWT errors | Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set and non-empty |
