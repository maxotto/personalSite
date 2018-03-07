var fsu = require('./utils/fsu');
var
    sourceFolder = '/usr/src/cameraServer/web-camera-in/camera2',
    destFolderRoot = '/usr/src/cameraServer/web-camera-storage/camera2',
    extension = 'jpg';
fsu.processCameraPictures(sourceFolder, destFolderRoot, extension);

sourceFolder = '/usr/src/cameraServer/web-camera-in/camera1';
destFolderRoot = '/usr/src/cameraServer/web-camera-storage/camera1';
extension = 'jpg';
fsu.processCameraPictures(sourceFolder, destFolderRoot, extension);
