FROM node:20 as frontend
WORKDIR /usr/src/app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install -ci
COPY frontend/ ./
RUN npm run build

FROM node:20
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install -ci
COPY backend/ ./

COPY --from=frontend /usr/src/app/build /frontend

RUN npx prisma generate
RUN npm run build

ENV SERVE_DIR=/frontend

EXPOSE 5000

CMD node build/src/index.js