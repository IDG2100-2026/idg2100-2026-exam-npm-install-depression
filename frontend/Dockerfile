FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
# --host exposes Vite outside the container
CMD ["npm", "run", "dev", "--", "--host"]
