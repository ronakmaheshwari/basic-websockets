FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma.config.ts ./

COPY prisma ./prisma
COPY src ./src

RUN npm install
RUN npm run generate:db
RUN npm run build

EXPOSE 3000
ENTRYPOINT ["npm", "run", "deploy"]