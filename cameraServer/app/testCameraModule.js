var config1 = {
    inRoot: '../web_camera_in/',
    outRoot: '../data/',
    cameraNumber: 2,
    extFilter: 'jpg',
    videoConcatPeriod: 60*1000,
    dayVideoCreateBatchSize: 100
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
    inRoot: '../web_camera_in/',
    outRoot: '../data/',
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