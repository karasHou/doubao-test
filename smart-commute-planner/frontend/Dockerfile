FROM node:20-slim as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
# Modify rollup's native.js to skip binary loading
RUN node -e "const fs = require('fs'); const path = require('path'); const filePath = path.join(__dirname, 'node_modules', 'rollup', 'dist', 'native.js'); fs.writeFileSync(filePath, 'export const parse = null; export const parseAsync = null;', 'utf8'); console.log('Overwrote rollup native.js to export empty parse functions');"

RUN npm run build

FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
