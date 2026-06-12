# Serviço único: builda o frontend e roda o Express (que serve o build + a API).
# Portável para Railway, Fly.io, ou qualquer host que rode containers.
FROM node:22-slim

WORKDIR /app

# Instala TODAS as dependências (o build precisa das devDependencies).
COPY package.json ./
RUN npm install

# Copia o código e gera o build do frontend (dist/).
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Aponte DATA_DIR para um volume montado para persistir o banco SQLite.
ENV DATA_DIR=/app/server/data

# O host normalmente injeta PORT; 4000 é o fallback.
EXPOSE 4000

CMD ["npm", "start"]
