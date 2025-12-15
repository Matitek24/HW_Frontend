# ETAP 1: Budowanie (Node.js - pełna wersja, nie Alpine, żeby uniknąć błędu musl/rollup)
FROM node:20 AS builder
WORKDIR /app

# Kopiowanie package.json
COPY package*.json ./

# Instalacja zależności (bez package-lock, żeby wymusić świeżą instalację pod architekturę kontenera)
RUN npm install

# Kopiowanie reszty kodu (dzięki .dockerignore nie skopiuje nam śmieci z komputera)
COPY . .

# Argument przekazywany przy budowaniu
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Budowanie
RUN npm run build

# ETAP 2: Serwowanie (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]