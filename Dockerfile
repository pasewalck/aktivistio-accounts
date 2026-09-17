FROM node:22.16.0

RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

WORKDIR /work

RUN apt-get update && apt-get install -y wget && apt-get clean

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=10s CMD wget --no-verbose --tries=5 --spider http://localhost:3000 || exit 1

CMD ["pnpm", "run", "start-launcher:production"]