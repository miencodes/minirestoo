# ----- TAHAP 1: Build -----
# kita pake base image Node.js buat 'npm run build'
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ----- TAHAP 2: Serve -----

FROM nginx:1.25-alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]