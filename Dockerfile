FROM node:22.16.0

WORKDIR /work

RUN apt-get update && apt-get install -y wget && apt-get clean

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=10s CMD wget --no-verbose --tries=5 --spider http://localhost:3000 || exit 1

CMD ["npm", "run", "production"]