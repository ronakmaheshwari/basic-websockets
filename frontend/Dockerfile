FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig*.json eslint.config.js vite.config.ts ./
COPY index.html ./

RUN npm install

COPY src ./src
COPY public ./public

RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]