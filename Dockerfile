FROM node:20.15.1-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY *.env .

RUN npm install

COPY . .

RUN npm run build
RUN npm prune --omit=dev

FROM node:20.15.1-alpine

WORKDIR /app

COPY --from=builder /app/dist/ ./dist
COPY --from=builder /app/node_modules/ ./node_modules
COPY --from=builder /app/prisma/migrations/ ./prisma/migrations

COPY --from=builder /app/*.env .
COPY --from=builder /app/package.json .
COPY --from=builder /app/prisma/schema.prisma ./prisma/

# Review if this is the best place to have this
RUN npx prisma migrate deploy

EXPOSE 3333

CMD ["npm", "start"]
