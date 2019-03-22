const _fs = require("fs-extra");
const videoLib = require("../utils/videoLib");
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
  this.onceCount = 0;
  this.foldersToMakeVideo = {};
  this.inFolder =
    this.config.inRoot + "camera" + this.config.cameraNumber + "/";
  this.outFolder =
    this.config.outRoot + "camera" + this.config.cameraNumber + "/";
  this.extFilter = this.config.extFilter;
  this.videoFileName = "cam" + this.config.cameraNumber + "Video.mp4";
  this.log = function() {
    console.log("Camera " + this.config.cameraNumber + ": ", ...arguments);
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
        case "makeDayVideo":
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
    _walk.sync(this.inFolder, function(file, stat) {
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
      _this.resume();
      this.startConcatVideoCycle();
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
          delSource: true,
          savePic: true,
          makeVideo: true,
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
      // _this.log(_this.foldersToMakeVideo);
      cb(null, 'Init is done.');
    }
  };

  this.processSingleFile = function(task, cb){
    const file = task.file;
    const dest = task.dest;
    const last = this.outFolder + 'last.jpg';
    if(task.savePic){
      _fs.copySync(file, dest);
      this.log('Picture copy saved.')
    }
    if(task.makeVideo){
      this.makeSingleVideo(file, () => {
        if(task.delSource){
          _fs.removeSync(file);
          this.log('Picture source deleted.')
        }
        cb(null, 'Process single file ' + file + ' finished');
      });
    }
  };

  this.makeSingleVideo = function(imageFileName, cb){
    const imageInfo = _path.parse(imageFileName);
    const tmpPath = _path.join(imageInfo.dir,'tmp');
    const videoFileName = _path.join(tmpPath,imageInfo.name + '.mp4');
    var _this = this;
    _fs.ensureDirSync(tmpPath);
    videoLib.createVideoBFromImage(imageFileName, videoFileName, function(newFile){
      var dateStamp = _path.basename(newFile).substring(0,8);
      if(!_this.foldersToMakeVideo.hasOwnProperty(dateStamp)){
        _this.foldersToMakeVideo[dateStamp] = [imageFileName];
      }
      _this.foldersToMakeVideo[dateStamp].push();
      _this.log(newFile+': new video file created.');
      cb() ;
    });
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
      // _this.startConcatVideoCycle();
      _this.log("Concat video cycle run.");
    }, _this.config.videoConcatPeriod);
  };
  return this;
};
