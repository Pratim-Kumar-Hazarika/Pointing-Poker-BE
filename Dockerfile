FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install typescript

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
