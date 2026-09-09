# Build multi-stage: compila com Vite numa imagem Node e serve o dist/ com nginx -- elimina a
# dependência de rodar "npm run build" local antes do docker-compose up (mesmo motivo do
# multi-stage do backend, ver ~/work/confectionery/Dockerfile).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
