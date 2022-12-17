FROM node:19
WORKDIR /app
COPY package.json .
COPY tsconfig.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]