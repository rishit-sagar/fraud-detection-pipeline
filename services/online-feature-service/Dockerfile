FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src

RUN npm run build

RUN npm prune --production

EXPOSE 8081

CMD ["node", "dist/index.js"]
