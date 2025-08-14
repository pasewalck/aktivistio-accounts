FROM node:22.16.0

WORKDIR /work

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "production"]

HEALTHCHECK  --interval=1m --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/ || exit 1