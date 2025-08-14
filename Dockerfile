FROM node:22.16.0

WORKDIR /work

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN apk update && apk add curl

EXPOSE 3000

HEALTHCHECK  --interval=3m --timeout=3s \
  CMD curl --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["npm", "run", "production"]