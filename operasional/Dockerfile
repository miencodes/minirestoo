# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua sisa source code
COPY . .

# ges, ini port buat service operasional
EXPOSE 3003

# Perintah untuk menjalankan aplikasi
CMD [ "node", "src/index.js" ]