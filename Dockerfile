FROM node:20

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get -y install graphicsmagick

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm install
RUN npm install --prefix ./server/ ./server/

COPY . .

EXPOSE 80

ENTRYPOINT ["/bin/sh", "-c" , "npm run start"]