const _fs = require("fs-extra");
const videoLib = new require("../utils/videoLib");
const picSel = require("../utils/PictureSelector");
const _fsu = require("../utils/fsu");
const _path = require("path"); //require node path module (a couple of tools for reading path names)
const _walk = require("walkdir");
const _ftpU = require("../utils/ftpu");
const _queue = require("better-queue", { concurrent: 1 });

module.exports = function(config) {
  const _this = this;
  // initilization
  this.config = config;
  this.videoLib = require("../utils/videoLibEx")(config);
  this.logger = require('../utils/logger')(config);
  this.onceCount = 0;
  this.foldersToMakeVideo = {};
  this.inFolder =
    this.config.inRoot + "camera" + this.config.cameraNumber + "/";
  this.outFolder =
    this.config.outRoot + "camera" + this.config.cameraNumber + "/";
  this.extFilter = this.config.extFilter;
  // this.videoFileName = "cam" + this.config.cameraNumber + "Video.mp4";
  this.log = function() {
    var args = [...arguments];
    this.logger.log({
      level: 'info',
      message: args
    });
  };
  this.queue = new _queue(function(task, cb) {
    _this.log("Task started.");
    if (!task.hasOwnProperty("action")) {
      _this.log("Action is undefined.");
      _this.log(task);
    } else {
      _this.log('Going to start "' + task.action + '" action.');
      switch (task.action) {
        case "init":
          _this.runInit(cb);
          break;
        case "singleFile":
          _this.log('Task ID is "' + task.id + '".');
          _this.processSingleFile(task, cb);
          break;
        case "makeDayVideoOnce":
          _this.makeDayVideoOnce(function(){
            cb(null, "Finish makeDayVideoOnce.");
          });
          break;
        case "startMainCycle":
          _this.startConcatVideoCycle();
          cb(null, "Finish startMainCycle.");
          break;
        case "concatVideo":
          break;
        default:
          _this.log('No function set for "' + task.action + " action.");
      }
    }
    // cb("Task finished.");
  });

  this.resume = function() {
    _this.log("Queue resumed.");
    this.queue.resume();
  };

  this.pause = function() {
    _this.log("Queue paused.");
    this.queue.pause();
  };

  _this.log("Start camera" + this.config.cameraNumber);
  _this.log("In folder is " + this.inFolder);
  this.pause();
  // кладем в очередь начальное задание
  this.queue.push({ action: "init" }, (err, result) => {
    if(err){
      _this.log(err);
    } else {
      _this.log(result);
    }
  });
  this.watch = function() {
    // Стартуем, первым исполнится начальное задание
    // Оно, по мере необходимости, добавит в очередь другие задания
    // А также выставит watcher на входную папку
    this.resume();
  };

  /**
   * Проинициализировать начальное состояние
   * Повесить watcher на входную папку
   */
  this.runInit = function(cb) {
    const found = [];
    _walk.sync(_path.resolve(this.inFolder), function(file, stat) {
      if (stat.isFile()) {
        found.push({
          fileFullName: file,
          info: _path.parse(file),
          stat: stat
        });
      }
    });
    this.onceCount = found.length;
    // console.log({found});
    _this.log("this.onceCount=", this.onceCount);
    if (found.length === 0) {
      // inFolder is empty. Just start concatinating cycle for new video files
      cb(null, 'Init is done.');
      // this.startConcatVideoCycle();
    } else {
      this.foldersToMakeVideo = {};
      found.forEach(function(file) {
        _this.log(file.info.base);
        const source = file.fileFullName;
        let destFolderName, destinationFile;
        const d = _this.makeDestinationFolder(file.info.base);
        destFolderName = d.destFolderName;
        destinationFile = d.destinationFile;
        if (!_this.foldersToMakeVideo.hasOwnProperty(destFolderName)) {
          _this.foldersToMakeVideo[destFolderName] = [];
        }
        _this.foldersToMakeVideo[destFolderName].push(destinationFile);
        _this.log({ destFolderName }, { destinationFile });
        _this.queue.push({
          action: 'singleFile',
          id: file.info.base,
          file: source,
          dest: destinationFile,
          delSource: false,
          savePic: true,
          makeVideo: false,
          ftpTransfer: {
            ftpDestFolder: '/htdocs/mikhailichenko.su/www/assets/',
            ftpPictureFileName: 'camera' + _this.config.cameraNumber + '.jpg',
          }
        }, (err, result) => {
          if( err ){
            _this.log(err);
          } else {
            _this.log(result);
          }
        });
      });
      _this.queue.push({
        action: 'makeDayVideoOnce'
      }, function (err, result){
        if( err ){
          _this.log(err);
        } else {
          _this.log(result);
        }
      });
      _this.queue.push({
        action: 'startMainCycle'
      }, function (err, result){
        if( err ){
          _this.log(err);
        } else {
          _this.log(result);
        }
      });
      cb(null, 'Init is done.');
    }
  };

  this.processSingleFile = function(task, cb){
    const file = task.file;
    const dest = task.dest;
    const last = this.outFolder + 'last.jpg';
    // TODO test each file to be real image
    if(task.savePic){
      _fs.copySync(file, dest);
      this.log('Picture copy saved.')
    }
    if(task.makeVideo){
      this.makeSingleVideo(file, dest, () => {
        if(task.delSource){
          _fs.removeSync(file);
          this.log('Picture source deleted.');
        }
        cb(null, 'Process single file ' + file + ' finished');
      });
    } else {
      if(task.delSource){
        _fs.removeSync(file);
        this.log('Picture source deleted.')
      }
      cb(null, 'Process single file ' + file + ' finished');
    }
  };

  this.makeSingleVideo = function(imageFileName, destImageFile, cb){
    const imageInfo = _path.parse(destImageFile);
    const tmpPath = _path.join(imageInfo.dir,'tmp');
    const videoFileName = _path.join(tmpPath,imageInfo.name + '.mp4');
    const _this = this;
    _fs.ensureDirSync(tmpPath);
    this.videoLib.createVideoBFromImage(imageFileName, videoFileName, function(newFile){
      const dateStamp = _path.basename(newFile).substring(0,8);
      if(!_this.foldersToMakeVideo.hasOwnProperty(dateStamp)){
        _this.foldersToMakeVideo[dateStamp] = [imageFileName];
      }
      _this.foldersToMakeVideo[dateStamp].push();
      _this.log(newFile+': new video file created.');
      cb() ;
    });
  };

  this.makeDayVideoOnce = function(cb){
    let count = 0;
    for (const ds in this.foldersToMakeVideo){
      if(this.foldersToMakeVideo.hasOwnProperty(ds)){
        count++;
      }
    }
    if( count === 0){
      cb();
      // _this.startConcatVideoCycle();
    } else {
      const _this = this;
      for (const dateStamp in this.foldersToMakeVideo){
        const videoFileName = "cam" + this.config.cameraNumber + "_" + dateStamp + ".mp4"
        if(this.foldersToMakeVideo.hasOwnProperty(dateStamp)){
          // Delete TMP folder with single video if exist because all images went into day video by this function
          const tmpFolderName = _path.join(this.outFolder,dateStamp,'tmp');
          _fs.removeSync(tmpFolderName);
          const dayVideoName = _path.join(this.outFolder, videoFileName);
          const sourceFolder = _path.join(this.outFolder,dateStamp);

          this.videoLib.startCreateVideoBFromPathBatch(sourceFolder, dayVideoName, this.config.dayVideoCreateBatchSize).then(res=>{
            _this.log(res);
            count--;
            if(count === 0){
              _this.log('Day videos are created');
              cb();
              // _this.startConcatVideoCycle();
            }
          });
          /*
          videoLib.createVideoBFromPathBatch(sourceFolder, dayVideoName, this.config.dayVideoCreateBatchSize, function(output){
            _this.log(output);
            count--;
            if(count === 0){
              _this.log('Day videos are created');
              cb();
              // _this.startConcatVideoCycle();
            }
          });
          */
          delete this.foldersToMakeVideo[dateStamp];
        }
      }
    }
  };

  this.makeDestinationFolder = function(file) {
    const fileName = file;
    const destFolderName = fileName.substring(0, 8);
    const newDestName = this.outFolder + destFolderName;
    _fsu.ensureExists(newDestName, 0o777, function(err) {
      if (err) {
        throw err;
      } else {
      }
    });
    const destinationFile = newDestName + "/" + fileName;
    return {
      destFolderName: destFolderName,
      destinationFile: destinationFile
    };
  };

  this.startConcatVideoCycle = function() {
    this.log("Start concat video cycle.");
    const _this = this;
    setTimeout(function() {
      // _this.concatVideo();
      _this.startConcatVideoCycle();
      _this.log("Inside video cycle.");
    }, _this.config.videoConcatPeriod);
  };

  this.concatVideo = function(){
    this.log('Do concat video', this.foldersToMakeVideo);
    const _this = this;
    for (const dateStamp in this.foldersToMakeVideo){
      if(this.foldersToMakeVideo.hasOwnProperty(dateStamp)){
        this.ensureDayVideoExists(dateStamp, function(ds){
          _this.concatVideoInFolder(ds);
        });
        delete this.foldersToMakeVideo[dateStamp];
      }
    }
  };

  this.ensureDayVideoExists = function(dateStamp, cb){
    const videoFileName = "cam" + this.config.cameraNumber + "_" + dateStamp + ".mp4"
    const destVideoName = _path.join(this.outFolder, videoFileName);
    if(_fs.existsSync(destVideoName)){
      cb(dateStamp);
    } else {
      const sourceFolder = _path.join(this.outFolder,dateStamp);
      const _this = this;
      videoLib.createVideoBFromPath(sourceFolder, destVideoName, function(output){
        /*
        const tmpFolderName = _path.join(_this.outFolder,dateStamp,'tmp');
        if(_fs.existsSync(tmpFolderName)){
            _fs.removeSync(tmpFolderName);
        }
        */
        console.log('New day video is created: ' + destVideoName);
        cb(dateStamp);
      });
    }
  };

  this.concatVideoInFolder = function(dateStamp){
    const _this = this;
    const sourceVideoFolder = _path.join(this.outFolder,dateStamp,'tmp');
    const tmpVideoName = _path.join(sourceVideoFolder,'tmp.mp4');
    _fs.readdir(sourceVideoFolder, function (err, list) {
      if (err){
        _this.log('No TMP folder to scan: ' + tmpVideoName);
      } else {
        const newVideo = [];
        list.forEach(function (value) {
          newVideo.push(_path.join(sourceVideoFolder, value));
        });
        console.log(newVideo);
        if(newVideo.length >0){
          const destVideoName = _path.join(_this.outFolder,dateStamp,_this.videoFileName);
          videoLib.mergeVideo(destVideoName, newVideo, tmpVideoName, function(){
            _fs.unlink(destVideoName, function(error) {
              if (error) {
                throw error;
              }
              _fs.rename(tmpVideoName,destVideoName, function(error){
                if (error) {
                  throw error;
                }
                console.log('File ' + destVideoName + ' rewritten.');
              });
            });
            newVideo.forEach(function(file){
              _fs.unlink(file, function(error) {
                if (error) {
                  throw error;
                }
                console.log('File ' + file + ' deleted.');
              });
            })
          });
        }
      }
    });
  };

  return this;
};
