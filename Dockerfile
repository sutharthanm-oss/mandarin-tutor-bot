FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .

# Persistent volume mount point for db.json (attach a Railway volume here)
VOLUME ["/data"]

CMD ["node", "src/index.js"]
