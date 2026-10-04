# StaffAway Backend

REST API for StaffAway, a multi-tenant leave management system. Employees request time off, managers and HR approve it, and everyone sees who is away on a shared team calendar. Every company is an isolated tenant in the same database.

Frontend: [StaffAway-Frontend](https://github.com/aleksa0206/StaffAway-Frontend) (Angular).

## Features

- **Leave requests**: create, edit and cancel requests, with an approval workflow (`Pending` → `Approval` / `Rejected`, owner can cancel before the leave starts). The API rejects overlapping requests and enforces minimum notice, and leave balances update automatically.
- **Approval rules**: nobody approves their own request, and managers decide only on their direct reports. Leave types can skip approval entirely.
- **Status history, comments, file attachments (S3), notifications and audit log.**
- **Company administration**: departments, leave types, public holidays, work schedules, company settings and API keys.
- **Roles**: `Employee`, `Manager`, `Hr`, enforced per endpoint and per record.

## Security

- The short-lived JWT access token (15 min) is returned in the response body. The refresh token is opaque, stored hashed, rotated on every use, and sent only as an `httpOnly`, `sameSite=strict` cookie.
- Optional TOTP two-factor authentication.
- Accounts lock after 5 failed logins. Login timing is the same whether or not the email exists, so it can't be used to discover accounts. Password reset uses hashed, expiring tokens.
- DB-backed rate limiting, so limits hold across multiple instances.
- Every query is scoped to the caller's company. Cross-tenant access returns 403/404.
- Environment variables are validated at startup, and the app refuses to boot with missing or weak config.

## Tech stack

Node.js 24, TypeScript, Express 5, Prisma 7 (MariaDB adapter) on MySQL 8, Zod, Pino, Jest + Supertest, AWS S3, Nodemailer, Docker.

Layered architecture: `routes → controllers → services → repositories → Prisma`. Business rules and authorization live in services, and only repositories touch the database.

## Getting started

Requirements: Node.js 24, Docker (for MySQL).

```bash
npm install
docker-compose up -d            # MySQL on localhost:3306
cp .env.example .env            # then fill in the values (see below)
npx prisma migrate deploy
npx prisma generate
npm run seed:demo               # optional demo company
npm run dev                     # http://localhost:4000
```

`npm run seed:demo` creates the "Northwind Studio" company and prints an HR, a manager and an employee login. The password for every demo account is `Password123`.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | no | Default `4000` |
| `NODE_ENV` | no | `development` / `test` / `production` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | yes | Used by the app at runtime. On Windows use `127.0.0.1`, not `localhost` |
| `DATABASE_URL` | yes | Used only by the Prisma CLI (migrations) |
| `JWT_SECRET` | yes | At least 32 characters |
| `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | yes | Attachment storage |
| `FRONTEND_URL` | in production | CORS origin and password-reset links. Default `http://localhost:5173` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | in production | Password-reset emails |

## Tests

Integration tests run against a real MySQL database configured in `.env.test` (same variables as above, pointing to a separate test database). S3 is replaced by an in-memory fake.

```bash
npm run test:migrate   # after every new migration
npm test
```

CI (GitHub Actions) runs formatting, type checking and the full test suite against MySQL 8 on every push, and builds the Docker image.

## Docker

```bash
docker build -t staffaway-backend .
docker run --env-file .env -p 4000:4000 staffaway-backend
```

The runtime image has no Prisma CLI. To run migrations, use the build stage:

```bash
docker build --target build -t staffaway-migrate .
docker run --env-file .env staffaway-migrate npx prisma migrate deploy
```

`GET /health` checks the database connection and returns 503 if the database is unreachable.
