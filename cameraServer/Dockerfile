FROM node:carbon
WORKDIR /usr/src/cameraServer/app
COPY ./app .
EXPOSE 3000
VOLUME ["/usr/src/cameraServer/web-camera-in", "/usr/src/cameraServer/web-camera-storage", "/usr/src/cameraServer/app"]
CMD [ "npm" , "start" ]
