<div align="center">

![Language](https://img.shields.io/badge/language-typescript-yellow?logo=ts-node&logoColor=white)
[![GitHub Workflow Status (main branch)](https://img.shields.io/github/actions/workflow/status/heldercostaa/Plann.erAPI/main.yml?branch=main&logo=dependabot&logoColor=white)](https://github.com/heldercostaa/Plann.erAPI)
[![codecov](https://codecov.io/github/heldercostaa/Plann.erAPI/graph/badge.svg?token=AXVY2L9IAS)](https://codecov.io/github/heldercostaa/Plann.erAPI)
[![Last commit](https://img.shields.io/github/last-commit/heldercostaa/Plann.er.svg?logo=github&logoColor=white)](https://github.com/heldercostaa/Plann.er/commits/main)
[![Maintainer](https://img.shields.io/badge/maintainer-%40heldercostaa-teal?logo=superuser&logoColor=white)](https://github.com/heldercostaa)
[![Linkedin](https://img.shields.io/badge/linkedin-blue.svg?logo=linkedin)](https://linkedin.com/in/heldercostaa/)

  <br />
  <a href="https://github.com/heldercostaa/Plann.erAPI">
    <img src="https://imgur.com/cYBdVNo.png" alt="Logo" width="80" height="80">
  </a>
  <h3 align="center" style="font-size: 3em;">Plann.er</h3>
  <p align="center">
    API repository for Plann.er, an application to manage your trips with guests, activities, links and more.
    <br />
    <a href="https://planner-heldercosta.vercel.app/"><strong>Explore the application live »</strong></a>
    <br />
    <br />
    <a href="https://github.com/heldercostaa/Plann.er">Application Repository</a>
    ·
    <a href="https://documenter.getpostman.com/view/8553383/2sA3kSm2ts">API Documentation</a>
  </p>
</div>

> [!NOTE]
> The application may not be live due to limitations of free deployment services. However, you can easily run the application locally by following the instructions in the [Local Setup Instructions](#local-setup-instructions) section.

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#local-setup-instructions">Local Setup Instructions</a>
    </li>
    <li>
      <a href="#api-documentation">API Documentation</a>
    </li>
    <li>
      <a href="#tests">Tests</a>
      <ul>
        <li><a href="#e2e-tests">E2E Tests</a></li>
      </ul>
      <ul>
        <li><a href="#coverage-report">Coverage Report</a></li>
      </ul>
    </li>
    <li>
      <a href="#api-documentation">Extra commands</a>
      <ul>
        <li><a href="#database">Database</a></li>
      </ul>
      <ul>
        <li><a href="#docker">Docker</a></li>
      </ul>
    </li>
  </ol>
</details>

## About The Project

<div>
  <img src="https://raw.githubusercontent.com/heldercostaa/Plann.er/main/docs/1.%20Landing%20page.png" alt="Landing page" style="width: 49%; border-radius: 5px; margin-bottom: 20px;"/>
  <img src="https://raw.githubusercontent.com/heldercostaa/Plann.er/main/docs/2.%20Trip%20page.png" alt="Trip page" style="width: 49%; border-radius: 5px; margin-top: 20px;"/>
</div>
<br />

This is the backend for a personal project inspired by this [Figma design](<https://www.figma.com/design/8DfcJnIMg1sqhIbHqZVGsR/Plann.er-(Web)?node-id=3-376>). It aims to be a complete project, featuring several features such as 100% test coverage, a real PostgreSQL database, input validations, email notifications, error handling, and more.
The goal is to explore and apply various technologies in a practical, production-like application. Note that the folder organization and structure are not entirely perfect due to the small scale of the application, so there are no services and the routing scenario is not ideal.

This project also includes a frontend component, which you can find in the repository [here](https://github.com/heldercostaa/Plann.er).

### Built With

[![Node](https://img.shields.io/badge/Node.js-222?logo=node.js&logoColor=5FA04E)](https://nodejs.org/en)
[![TypeScript](https://img.shields.io/badge/TypeScript-222?logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-222?logo=postgresql&logoColor=4169E1)](https://www.postgresql.org)
[![Fastify](https://img.shields.io/badge/Fastify-222?logo=fastify&logoColor=aaa)](https://fastify.dev)
[![Zod](https://img.shields.io/badge/Zod-222?logo=zod&logoColor=3E67B1)](https://zod.dev)
[![Prisma](https://img.shields.io/badge/Prisma-222?logo=prisma&logoColor=3E67B1)](https://www.prisma.io)
[![Vitest](https://img.shields.io/badge/Vitest-222?logo=vitest&logoColor=6E9F18)](https://vitest.dev)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-222?logo=minutemailer&logoColor=30B980)](https://nodemailer.com)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-222?logo=githubactions&logoColor=2088FF)](https://docs.github.com/en/actions)
[![Codecov](https://img.shields.io/badge/Codecov-222?logo=codecov&logoColor=F01F7A)](https://about.codecov.io)
[![pino](https://img.shields.io/badge/pino-222?logo=pino&logoColor=687634)](https://github.com/pinojs/pino)
[![commitlint](https://img.shields.io/badge/commitlint-222?logo=commitlint&logoColor=aaa)](https://commitlint.js.org/)

## Local Setup Instructions

1. **Install Dependencies**: Navigate to the project directory and install the necessary dependencies:

   ```bash
   cd ../Plann.erAPI
   npm install
   ```

2. **Environment Variables**: Create `.env` and `.env.test` files to store your environment variables. You can copy the example file and then edit it:

   ```bash
   cp .env.example .env
   cp .env.test.example .env.test
   ```

3. **Run Development Server (with docker)**: The easiest way to run the backend is with Docker Compose. It will automatically create the PostgreSQL instances (for development and tests), execute the migrations, and start the API. Run:

   ```bash
   npm run dev:docker    # Or simply 'docker compose up -d'
   ```

<div align="center">
  <img src="./docs/5. Docker Compose.png" alt="Docker compose" style="width: 60%; border-radius: 5px;"/>
</div>

4. **Run Development Server (without docker)**: You can also manually run the application, but to unlock all features, you must have a PostgreSQL database set up (or use a hosted one). After that, run:

   ```bash
   npm run dev
   ```

<div align="center">
  <img src="./docs/2. Terminal.png" alt="Terminal" style="width: 70%; border-radius: 5px;"/>
</div>

5. **Frontend Interface (Optional)**: If you want to experience the application with a full frontend, follow the [Application Local Setup Instructions](https://github.com/heldercostaa/Plann.er#local-setup-instructions) to have it running. This step is optional as the API can be entirely called by endpoints.

## API Documentation

Feel free to import the Postman files under [![Postman](https://img.shields.io/badge/postman-222?logo=postman&logoColor=FF6C37)](.postman) into your Postman client. Alternatively, you can access the [API Documentation](https://documenter.getpostman.com/view/8553383/2sA3kSm2ts) and check the documented endpoints with request examples.

<div align="center">
  <img src="./docs/1. API Documentation.png" alt="API Documentation" style="width: 95%; border-radius: 5px;"/>
</div>

## Tests

### E2E Tests

To run the E2E tests, a testing database is required, preferably a different instance from the development one. If you ran the application with Docker Compose, it will have one generated. If not, you must set it up and specify the credentials in the `.env.example` file.

After setting up a test database, run the tests with:

```bash
npm run test
```

<div align="center">
  <img src="./docs/3. Tests.png" alt="Tests" style="width: 70%; border-radius: 5px;"/>
</div>

### Coverage Report

Generate a coverage report with:

```bash
npm run test:coverate
```

<div align="center">
  <img src="./docs/4. Tests Coverage.png" alt="Tests Coverage" style="width: 65%; border-radius: 5px;"/>
</div>

## Extra commands

Few useful extra commands for docker and database.

### Database

```bash
npx prisma migrate dev    # Compare schema with db and create migrations
npx prisma studio         # Opens prisma studio to view the database
```

### Docker

```bash
docker build -t planner-api:v1 .
docker run -d --name planner-api -p 3333:3333 planner-api:v1
```
