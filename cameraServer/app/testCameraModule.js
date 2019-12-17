var config1 = {
    inRoot: '../web_camera_in/',
    outRoot: '../data/',
    cameraNumber: 2,
    extFilter: 'jpg',
    videoConcatPeriod: 60*1000,
    videoOptions: {
        fps: 25,
        loop: 0.2, // seconds
        transition: false,
        // transitionDuration: 0.1, // seconds
        videoBitrate: 1024,
        videoCodec: 'libx264',
        size: '1920x1080',
        // audioBitrate: '128k',
        // audioChannels: 2,
        format: 'mp4'
        // pixelFormat: 'yuv420p'
    },
    dayVideoCreateBatchSize: 50,
    logger: {
        transports: {
            console: {
                level: 'info'
            },
            file: {
                level: 'error'
            }
        },
    }
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
