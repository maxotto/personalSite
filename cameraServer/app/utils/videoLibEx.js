var videoshow = require('videoshow');
var fs = require('fs-extra');
var path = require('path');
let videoOptions;
let logger;
let log;

class VideoLib{

  constructor(config){
    videoOptions = config.videoOptions;
    logger = require('../utils/logger')(config);
    log = function() {
      var args = [...arguments];
      logger.log({
        level: 'info',
        message: args
      });
    };
  };



  mergeVideo(mainVideo, newVideos, outVideo, cb){
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
        log('Error ' + err.message);
      })
      .on('end', function() {
        cb();
      });
  }

  async startCreateVideoBFromPathBatch(picFolder, outFile, batchSize){
    await createVideoBFromPathBatch(picFolder, outFile, batchSize);
    return 'startCreateVideoBFromPathBatch Done!'
  }

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
    const res = await _processBatch(batch, batchFileName);
    log(res);
  }, Promise.resolve());
  const r = await _mergeBatches(mainVideo, videoToMerge, outFile);
  log(r);
}

function createBatchFileName(mainFile, batchNumber){
  var p = path.parse(mainFile);
  return path.resolve(p.dir, p.name + "_batch_" + String(batchNumber) + p.ext);
}

function _processBatch(batch, batchFileName){
  return new Promise((resolve, reject) => {
    videoshow(batch, videoOptions)
      .save(batchFileName)
      .on('start', function (command) {
      })
      .on('progress', function (data) {
      })
      .on('error', function (err) {
        this.error(batchFileName,'Error:', err);
      })
      .on('end', function (output) {
        resolve('Batch finished, ' + batchFileName + ' created.');
      });
  });
}

function _mergeBatches(mainVideo, videoToMerge, outFile){
  return new Promise((resolve, reject) => {
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
      log('Error ' + err.message);
    })
    .on('end', function() {
      cb();
    });
}

module.exports = (config) => { return new VideoLib(config) };
