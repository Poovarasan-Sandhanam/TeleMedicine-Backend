# ---------- build stage ----------
# Compiles TypeScript with devDependencies available, then throws them away.
FROM node:20-alpine AS build

WORKDIR /app

# `npm ci` installs exactly what package-lock.json pins and starts from a clean
# node_modules. `npm install` trusts an existing tree without verifying it, which
# is how this project shipped a broken mongoose install for months.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# ---------- runtime stage ----------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
# Overridden by the platform; the default means a container can never bind a
# random port if SERVER_PORT is missing.
ENV SERVER_PORT=3000

WORKDIR /app

# Production dependencies only - no typescript, ts-node or nodemon in the image.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# The node image ships an unprivileged `node` user; don't run as root.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.SERVER_PORT||3000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Runs the compiled output, not ts-node under a file watcher.
CMD ["node", "dist/server.js"]
