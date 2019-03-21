var config1 = {
    inRoot: 'C:/web_camera_in/',
    outRoot: 'C:/web_camera_data/',
    cameraNumber: 2,
    extFilter: 'jpg',
    videoConcatPeriod: 60*1000,
    /* ftpConfig: {
        host: 'srv038.infobox.ru',
        port: 21,
        user: 'z94056____',
        password: '942U26mlP1___'
    }
    */
};
var camera1 = new (require('./core/camera'))(config1);
camera1.watch();

var config2 = {
    inRoot: 'C:/mikhailichenko.site/cameraServer/web-camera-in/',
    outRoot: 'C:/mikhailichenko.site/cameraServer/data/',
    cameraNumber: 2,
    extFilter: 'jpg',
    videoConcatPeriod: 60*1000,
    ftpConfig: {
        host: 'srv038.infobox.ru',
        port: 21,
        user: 'z94056',
        password: '942U26mlP1'
    }
};
// var camera2 = new (require('./core/camera'))(config2);
// camera2.watch();