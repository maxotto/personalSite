FROM node:carbon
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
VOLUME ["/usr/src/app/web-camera-in", "/usr/src/app/web-camera-storage"]
CMD [ "npm" , "start" ]
