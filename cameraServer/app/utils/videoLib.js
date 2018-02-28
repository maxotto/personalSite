var videoshow = require('videoshow');
var fs = require('fs');

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
    format: 'mp4'
    // pixelFormat: 'yuv420p'
};
function mergeVideo(mainVideo, newVideos, outVideo, cb){
    'use strict';
    var images = [mainVideo];
    newVideos.forEach(function (fileName, index){
        images.push(fileName);
    });
    var mergedVideo = videoshow.ffmpeg();
    var videoNames = images;

    videoNames.forEach(function(videoName){
        mergedVideo = mergedVideo.addInput(videoName);
    });

    mergedVideo.mergeToFile(outVideo, './tmpVideo/')
        .on('error', function(err) {
            console.log('Error ' + err.message);
        })
        .on('end', function() {
            // console.log('Finished!');
            cb();
        });
}
function concatVideo(mainVideo, newVideos, delNewAfter, cb){
    'use strict';
    console.log(mainVideo);
    console.log(newVideos);
    var images = [mainVideo];
    newVideos.forEach(function(fileName, index) {
        images.push(fileName);
    });
    var listFileName = 'list.txt', fileNames = '';
// ffmpeg -f concat -i mylist.txt -c copy output
    images.forEach(function (fileName, index) {
        fileNames = fileNames + 'file ' + "'" + fileName + "'\n";
    });
    fs.writeFileSync(listFileName, fileNames);
    var merge = videoshow.ffmpeg();
    merge.input(listFileName)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-vcodec copy', '-acodec copy'])
        .save(mainVideo)
        .on('end', function(stdout, stderr) {
            console.log('Transcoding succeeded !');
            if(delNewAfter) {
                console.log('Will delete new files !');
            }
            cb();
        });
}

function createVideoBFromPath(picFolder, outFile, cb) {
    'use strict';
    var images = [];
    var isNoFile = true;
    fs.readdirSync(picFolder).forEach(function(file) {
        var fullName = picFolder + file;
        images.push(fullName);
        isNoFile = false;
    });
    if(isNoFile) {
        images.push('blank.jpg');
    }
    videoshow(images, videoOptions)
        .save(outFile)
        .on('start', function (command) {
            // console.log('ffmpeg process started:', command)
        })
        .on('progress', function (data) {
            // console.log('->', data.percent);
        })
        .on('error', function (err) {
            console.error('Error:', err);
        })
        .on('end', function (output) {
            cb(output);
        });
}
function createVideoBFromImage(file, outFile, cb) {
    'use strict';
    var images = [file];
    videoshow(images, videoOptions)
        .save(outFile)
        .on('start', function (command) {
            //console.log('ffmpeg process started:', command)
        })
        .on('progress', function (data) {
            // console.log('->', data.percent);
        })
        .on('error', function (err) {
            console.error('Error:', err);
        })
        .on('end', function (output) {
            cb(output);
        });
}
module.exports.createVideoBFromPath = createVideoBFromPath;
module.exports.createVideoBFromImage = createVideoBFromImage;
module.exports.concatVideo = concatVideo;
module.exports.mergeVideo = mergeVideo;
module.exports.videoOptions = videoOptions;
