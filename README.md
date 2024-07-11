# Plann.erAPI

[![Maintainer](https://img.shields.io/badge/maintainer-%40heldercostaa-blue?logo=superuser&logoColor=white)](https://github.com/heldercostaa)
![Language](https://img.shields.io/badge/language-typescript-yellow?logo=ts-node&logoColor=white)
[![CircleCI](https://circleci.com/gh/heldercostaa/Plann.erAPI.svg?style=shield)](https://app.circleci.com/pipelines/github/heldercostaa/Plann.erAPI)
[![codecov](https://codecov.io/github/heldercostaa/Plann.erAPI/graph/badge.svg?token=AXVY2L9IAS)](https://codecov.io/github/heldercostaa/Plann.erAPI)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/heldercostaa/Plann.erAPI/main.yml?branch=main&logo=dependabot&logoColor=white)](https://github.com/heldercostaa/Plann.erAPI)
[![Last commit](https://img.shields.io/github/last-commit/heldercostaa/Plann.erAPI.svg?logo=github&logoColor=white)](https://github.com/heldercostaa/Plann.erAPI/commits/main)

API for Plann.er App.

## Setup

```bash
cd ../Plann.erAPI
npm install
cp .env.example .env
cp .env.test.example .env.test
npm run dev
```

## Database

```bash
npx prisma migrate dev # Compare schema with db and create migrations
npx prisma studio      # Opens prisma studio to view the database
```

## Tests

```bash
npm run test
```

## Tools

- **Fastify**: As web api framework.
- **Zod**: For schema validation (.env, request body).
- **Prisma**: As ORM.
- **SQLite**: As simple database.
- **Nodemailer**: As to easily test email sending.
- **Vitest**: To write tests.
- **Supertest**: To help test the application without any port.
- **tsup**: To bundle the code.
- **commitlint**: To force conventional commits.
- **husky**: To force hooks before push (test and commit message).

## Roadmap

- [ ] Add coverage report
- [ ] Add nice logger lib
- [ ] Deploy the application
