FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --force

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
