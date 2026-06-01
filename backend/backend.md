# Backend

Node.js + Express + MongoDB + Socket.io. Based on my Oblig 3 backend but pretty much rewritten.

---

## How to run it

You need Node 20+ and MongoDB running locally on port 27017. If you don't have Mongo installed you can spin it up with Docker:

```bash
docker run -d -p 27017:27017 mongo
```

Then:

```bash
cd backend
npm install
npm run seed    # clears the DB and inserts test data
npm run dev     # starts on http://localhost:4567
```

The dev script uses `--watch` so it restarts automatically on file changes.

---

## Environment

The `.env.dev` file is already there with working defaults. The only thing you might need to fill in is the Mailtrap credentials if you want email to actually send (verification links, forgot password). You get those from the Mailtrap dashboard under Email Testing → Inboxes → SMTP Settings.

```
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
```

Everything else works without it — you'll just get an SMTP error when registering or requesting a password reset.

---

## Test accounts (from seed)

| Username | Password | Role |
|---|---|---|
| `admin_guri` | `Admin1234` | admin |
| `pokerqueen67` | `Queen1234` | registered |
| `dicemaster99` | `Dice1234` | registered |
| `rollin_thor` | `Thor1234` | registered |

Note: seeded users aren't email-verified, so they can't join matches/tournaments out of the box. Either verify them through Mailtrap or comment out the `isEmailVerified` check in `matchService.js` and `tournamentService.js` for local testing.

---

## API

Base URL: `http://localhost:4567/api`

- `/api/users` — register, login, logout, refresh token, profiles, email verification, password reset, admin user management
- `/api/matches` — lobby, create/join/leave matches, game state restore
- `/api/tournaments` — full CRUD, join/leave, start (generates matches automatically)
- `/api/stats` — platform activity for the homepage, admin dashboard with security incidents

There are `.http` test files in `REST scripts/` for the VS Code REST Client extension. Run `auth_tests.http` first to get tokens, then use those in the other files.

---

## WebSockets

All namespaces require the access token in the handshake: `{ auth: { token: "..." } }`.

- `/game` — dice rolls, betting, fold, reveal. Private rolls only go to the player they belong to.
- `/comments` — new comments broadcast instantly to everyone viewing a match or tournament.
- `/matches` — player join/leave notifications for the lobby.

---

## Folder structure

```
backend/
  config/       DB connection
  controllers/  HTTP handlers (thin — just call services and return responses)
  middleware/   JWT auth, rate limiting, input validation, file upload
  models/       Mongoose schemas
  routes/       Express routers
  services/     All the actual business logic lives here
  sockets/      Socket.io handlers
  utils/        Password hashing (scrypt), Elo calculator, mailer
  validators/   Input validation rules (express-validator)
  scripts/      Seed script + JSON data files
```
