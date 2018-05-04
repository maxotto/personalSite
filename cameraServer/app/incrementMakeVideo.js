var videoshow = require('videoshow');
const fs = require('fs');

var videoOptions = {
    fps: 25,
    loop: 0.2, // seconds
    transition: false,
    // transitionDuration: 0.1, // seconds
    videoBitrate: 1024,
    videoCodec: 'libx264',
    size: '1920x1080',
    // audioBitrate: '128k',
    // audioChannels: 2,
    format: 'mp4',
    // pixelFormat: 'yuv420p'
};
var images = [];
const picFolder = '../data/camera1/20180218/';
fs.readdirSync(picFolder).forEach(function(file) {
    var fullName = picFolder + file;
    images.push(fullName);
});
// console.log(images);
// берем первый кадр из массива, делаем из него видео
createVideo(images[0], 'video.mp4');
createVideo(images[1], 'video2.mp4');
var i = 0;
//потом прибавляем к нему новые кадры поштучно

function createVideo(image, outFile){
    videoshow([image], videoOptions)
        .save(outFile)
        .on('start', function (command) {
            console.log('ffmpeg process started:', command)
        })
        .on('progress', function (data) {
            console.log('->', data.percent);
        })
        .on('error', function (err) {
            console.error('Error:', err)
        })
        .on('end', function (output) {
            console.log('Video created in:', output);
            // concatVideo('video.mp4', images[1]);
        });

}