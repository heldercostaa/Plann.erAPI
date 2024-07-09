# Plann.erAPI

[![Maintainer](https://img.shields.io/badge/maintainer-%40heldercostaa-blue?logo=superuser&logoColor=white)](https://github.com/heldercostaa)
![Language](https://img.shields.io/badge/language-typescript-yellow?logo=ts-node&logoColor=white)
[![GitHub Workflow Status (main branch)](https://img.shields.io/github/actions/workflow/status/heldercostaa/Plann.erAPI/main.yml?branch=main&logo=dependabot&logoColor=white)](https://github.com/heldercostaa/Plann.erAPI)
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

- **Fastify**: As web framework.
- **Zod**: For schema validation (.env, request body).
- **Prisma**: As ORM.
- **SQLite**: As simple database.
- **Vitest**: To write tests.
- **Supertest**: To help test the application without any port.
- **tsup**: To bundle the code.
- **commitlint**: To force conventional commits.
- **husky**: To force hooks before push (test and commit message).
- **commitizen**: To help build the commit messages.
