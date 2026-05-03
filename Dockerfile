# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Instalar dependências (incluindo dev)
RUN npm ci

# Compilar TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init para melhor manipulação de sinais
RUN apk add --no-cache dumb-init

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar schema do Prisma
COPY prisma ./prisma

# Copiar aplicação compilada do stage anterior
COPY --from=builder /app/dist ./dist

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expor porta (ajuste conforme sua aplicação)
EXPOSE 3000

# Usar dumb-init para executar o processo
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/index.js"]
