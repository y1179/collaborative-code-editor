#build the frontend
FROM node:20-alpine as frontend-build

#copy the dist folder
COPY ./frontend /app

WORKDIR /app

RUN npm install

RUN npm run build

#build the backend
FROM node:20-alpine

COPY ./backend /app

WORKDIR /app

RUN npm install

#copy the build from the frontend-build stage
COPY --from=frontend-build /app/dist /app/public


CMD ["node","server.js"]
