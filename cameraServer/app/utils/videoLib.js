var videoshow = require('videoshow');
var fs = require('fs-extra');
var path = require('path');
const queue = require("better-queue", { concurrent: 1 });

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
    images.forEach(function(videoName){
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
        var fullName = picFolder + '/' + file;
        // console.log(path.extname(fullName));
        if(path.extname(fullName) === '.jpg'){
            images.push(fullName);
        }
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

async function createVideoBFromPathBatch(picFolder, outFile, batchSize, cb) {
    'use strict';
    var images = [];
    var isNoFile = true;
    var batches = [];
    var counter = 0;
    fs.readdirSync(picFolder).forEach(function(file) {
        counter++;
        var fullName = picFolder + '/' + file;
        // console.log(path.extname(fullName));
        // TODO check file is really picture
        if(path.extname(fullName) === '.jpg'){
            images.push(fullName);
        }
        if(counter === batchSize){
            batches.push(images);
            images = [];
            counter = 0;
        }
        isNoFile = false;
    });
    batches.push(images);
    if(isNoFile) {
        batches.push(['blank.jpg']);
    }
    // console.log({batches});
    var batchesCount = batches.length;
    var readyBatches = 0;
    var mainVideo;
    var videoToMerge = [];
    let count = 0;

    await batches.reduce(async (promise, batch) => {
        await promise;
        var batchFileName = createBatchFileName(outFile,count);
        if(count === 0){
            mainVideo = batchFileName;
        } else {
            videoToMerge.push(batchFileName);
        }
        count++;
        const res = await _processBatch(batch, batchFileName, videoOptions);
        console.log(res);
    }, Promise.resolve());
    // console.log('Batches are created. Lets merge them!');
    // console.log(mainVideo);
    // console.log(videoToMerge);
    const r = await _mergeBatches(mainVideo, videoToMerge, outFile);
    console.log(r);
}

function _mergeBatches(mainVideo, videoToMerge, outFile){
    return new Promise((resolve, reject) => {
        // console.log('inside _mergeBatches, ' + outFile);
        if(videoToMerge.length === 0){
            fs.move(mainVideo, outFile, err => {
                if(err){
                    reject(err);
                } else {
                    resolve('createVideoBFromPathBatch (1 batch exists) ready: ' + outFile + '.');
                }
            })
        } else {
            mergeVideo(mainVideo, videoToMerge, outFile, res => {
                fs.remove(mainVideo, err => {
                    if(err){
                        reject(err);
                    }
                    let delCount = 0;
                    const toDelCount = videoToMerge.length;
                    videoToMerge.forEach(fileToDel => {
                        fs.remove(fileToDel, err =>{
                            if(err){
                                reject(err);
                            }
                            delCount++;
                            if(delCount === toDelCount){
                                resolve('createVideoBFromPathBatch (normal batches) ready: ' + outFile + '.');
                            }
                        })
                    })
                });
            });
        }
    });
}

function _processBatch(batch, batchFileName, videoOptions){
    return new Promise((resolve, reject) => {
        // console.log('inside processBatch, ' + batchFileName);
        videoshow(batch, videoOptions)
          .save(batchFileName)
          .on('start', function (command) {
              //console.log(batchFileName,'ffmpeg process started:', command)
          })
          .on('progress', function (data) {
              //console.log(batchFileName,'->', data.percent);
          })
          .on('error', function (err) {
              console.error(batchFileName,'Error:', err);
          })
          .on('end', function (output) {
              // console.log('--> Batch finished, ' + batchFileName + ' created.');
              resolve('Batch finished, ' + batchFileName + ' created.');
          });
    });
}

async function startCreateVideoBFromPathBatch(picFolder, outFile, batchSize){
    await createVideoBFromPathBatch(picFolder, outFile, batchSize);
    return 'startCreateVideoBFromPathBatch Done!'
}
function createBatchFileName(mainFile, batchNumber){
    var p = path.parse(mainFile);
    return path.resolve(p.dir, p.name + "_batch_" + String(batchNumber) + p.ext);
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
            console.log(file);
            console.error('Error:', err);
        })
        .on('end', function (output) {
            cb(output);
        });
}
module.exports.createVideoBFromPath = createVideoBFromPath;
module.exports.startCreateVideoBFromPathBatch = startCreateVideoBFromPathBatch;
module.exports.createVideoBFromImage = createVideoBFromImage;
module.exports.concatVideo = concatVideo;
module.exports.mergeVideo = mergeVideo;
module.exports.videoOptions = videoOptions;

/*
function waitFor(ms){
return new Promise(r => setTimeout(r, ms));
}
console.log('start');
const a = [1,2,3,4,5,6]
var count = 21;
async function doit(){
    console.log('inside doit');
    await a.reduce(async (promise, num) => {
        await promise;
        await waitFor(500);
        console.log(num + (++count));
    }, Promise.resolve());
}
async function start(){
    await doit();
    console.log('finish');
    return 'Done that!'
}
start().then(res=>{
    console.log(res);
});

*/
