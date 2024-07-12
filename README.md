# Plann.erAPI

[![Maintainer](https://img.shields.io/badge/maintainer-%40heldercostaa-blue?logo=superuser&logoColor=white)](https://github.com/heldercostaa)
![Language](https://img.shields.io/badge/language-typescript-yellow?logo=ts-node&logoColor=white)
[![CircleCI](https://circleci.com/gh/heldercostaa/Plann.erAPI.svg?style=shield)](https://app.circleci.com/pipelines/github/heldercostaa/Plann.erAPI)
[![codecov](https://codecov.io/github/heldercostaa/Plann.erAPI/graph/badge.svg?token=AXVY2L9IAS)](https://codecov.io/github/heldercostaa/Plann.erAPI)
[![Last commit](https://img.shields.io/github/last-commit/heldercostaa/Plann.erAPI.svg?logo=github&logoColor=white)](https://github.com/heldercostaa/Plann.erAPI/commits/main)

<!-- [![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/heldercostaa/Plann.erAPI/main.yml?branch=main&logo=dependabot&logoColor=white)](https://github.com/heldercostaa/Plann.erAPI) -->

API for Plann.er App.

## Setup

```bash
cd ../Plann.erAPI
npm install
cp .env.example .env
cp .env.test.example .env.test
npm run dev
```

## Postman

Feel free to import the postman files under [`.postman`](.postman).

## Database

```bash
npx prisma migrate dev # Compare schema with db and create migrations
npx prisma studio      # Opens prisma studio to view the database
```

## Tests

```bash
npm run test          # run all tests
npm run test:coverate # run tests and generate coverage report under ./coverage
```

## Tools

- **Fastify**: As web api framework.
- **Zod**: For schema validation (.env, request body).
- **Prisma**: As ORM.
- **SQLite**: As simple database.
- **Nodemailer**: To easily test email sending.
- **Vitest**: To write tests.
- **Supertest**: To help test the application without any port.
- **tsup**: To bundle the code.
- **CircleCI**: To manage pipelines.
- **codecov**: To get test coverage.
- **Pino**: As logger library.
- **commitlint**: To force conventional commits.
- **husky**: To force hooks before push (test and commit message).

## Roadmap

- [ ] Deploy the application live
