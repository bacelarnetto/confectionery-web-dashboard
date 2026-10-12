# Build multi-stage: compila com Vite numa imagem Node e serve o dist/ com nginx -- elimina a
# dependência de rodar "npm run build" local antes do docker-compose up (mesmo motivo do
# multi-stage do backend, ver ~/work/confectionery/Dockerfile).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Endereço público do Keycloak, embutido no bundle em build time. Vazio = http://localhost:8180 (local).
ARG VITE_KEYCLOAK_URL=
ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# A imagem do nginx aplica envsubst em /etc/nginx/templates/*.template no boot (só nas variáveis
# definidas no ambiente, então $host, $upstream etc. do nginx ficam intactos).
ENV KEYCLOAK_ORIGIN=http://localhost:8180
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
