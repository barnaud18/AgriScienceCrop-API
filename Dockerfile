# Dockerfile para o Backend AgriScienceCrop
FROM node:18-alpine

# Instalar dependências do sistema necessárias para bcrypt e outras dependências nativas
RUN apk add --no-cache python3 make g++

# Criar diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json primeiro para cache de dependências
COPY package*.json ./

# Instalar dependências (incluindo dev para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Construir o projeto
RUN npm run build

# Remover devDependencies após build
RUN npm prune --omit=dev

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Mudar ownership dos arquivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando para iniciar a aplicação
CMD ["npm", "start"]
