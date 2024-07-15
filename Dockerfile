FROM node:20.15.1-alpine AS base
WORKDIR /app

COPY ./package.json ./package-lock.json ./*.env ./

RUN npm install

COPY . .

RUN npx prisma generate

FROM base AS dev
WORKDIR /app

EXPOSE 3333

CMD ["npm", "run", "dev"]

FROM base AS build

# RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM node:20.15.1-alpine AS prod
WORKDIR /app

COPY --from=build /app/dist/ ./dist
COPY --from=build /app/node_modules/ ./node_modules
COPY --from=build /app/prisma/migrations/ ./prisma/migrations
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma/schema.prisma ./prisma/schema.prisma

EXPOSE 3333

CMD ["npm", "start"]
