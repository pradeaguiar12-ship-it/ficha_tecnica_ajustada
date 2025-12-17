# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* bun.lockb* ./

# Instalar dependências
RUN npm ci || npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# ---- Production Stage ----
FROM nginx:alpine AS runner

# Copiar arquivos buildados para nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração customizada do nginx para SPA
RUN echo 'server { \
    listen 8080; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
