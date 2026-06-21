# Railway deploy image for the Vite SPA. Node 22 (Vite 8 needs >=22.12/20.19).
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
# Vite bakes these in at build time; Railway passes service vars as build args.
ARG VITE_API_BASE
ARG VITE_MAPBOX_TOKEN
ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
# serve the SPA with history fallback on Railway's $PORT
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
