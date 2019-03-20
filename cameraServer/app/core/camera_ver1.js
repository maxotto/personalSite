var _fs = require('fs-extra');
var videoLib = require('../utils/videoLib');
var picSel = require('../utils/PictureSelector');
var _fsu = require('../utils/fsu');
var _path = require('path');
var _walk = require('walkdir');
var _ftpU = require('../utils/ftpu');
var _queue = require('better-queue', { concurrent: 1 });

module.exports = function(config){
    var _this = this;
    this.queue = new _queue(function (task, cb) {
        if( task.action === 'singleFile'){
            _this.pause();
            console.log('Start process a single image file ' + task.id);
            _this.processSingleFile(task, cb);
        }

        if( task.action === 'makeDayVideo'){
            _this.pause();
            console.log('Start makeDayVideo ');
            _this.makeDayVideoOnce(function(){
                console.log('Finish makeDayVideo ');
                _this.resume();
            });
        }
    });
    this.resume = function(){
        console.log('!Queue resumed.');
        this.queue.resume();
    };

    this.pause = function(){
        console.log('!Queue paused');
        this.queue.pause();
    };
    this.pause();
    this.config = config;
    this.inFolder = this.config.inRoot + 'camera' + this.config.cameraNumber + '/';
    this.outFolder = this.config.outRoot + 'camera' + this.config.cameraNumber + '/';
    this.extFilter = this.config.extFilter;
    this.videoFileName = 'cam' + this.config.cameraNumber + 'Video.mp4';
    this.onceCount = 0;

    this.watch = function(){
        console.log('Start camera' + this.config.cameraNumber);
        this.init();
        this.addWatcher();
    };

    this.processSingleFile = function(task, cb){
        var file = task.file;
        var dest = task.dest;
        var last = task.last;
        var ftpDestFolder = task.ftpDestFolder;
        var ftpFileName = task.ftpFileName;
        _fsu.copyFile(file, dest, function (err) {
            if (err) {
                console.log(err);
            }
            _this.makeSingleVideo(dest, function(){
                _fsu.copyFile(file, last, function (err) {
                    if(err) {
                        console.log(err);
                    }
                    _fs.unlink(file, function (error) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('File ' + file + ' deleted.');
                        }
                    });
                    /*
                    _ftpU.ftpPut(_this.config.ftpConfig, last, ftpDestFolder, ftpFileName, function(err){
                        if(err) throw err;
                        console.log('Sent by FTP');
                        cb(null, 'OK');
                        _this.resume();
                    })
                    */
                });
            });
        });
    };

    this.init = function(){
        var found = [];
        _walk.sync(this.inFolder, function(file, stat) {
            if(stat.isFile()){
                found.push({
                    fileFullName: file,
                    info: _path.parse(file),
                    stat: stat
                });
            }
        });
        this.onceCount = found.length;
        console.log('this.onceCount=',this.onceCount);
        var _this = this;
        var foldersToMakeVideo = {};
        if(found.length === 0){
            // inFolder is empty. Just start concatinating cycle for new video files
            _this.resume();
            this.startConcatVideoCycle();
        } else {
            found.forEach(function(file){
                console.log(file.info.base);
                var source = file.fileFullName;
                var destFolder = _this.makeDestinationFolder(file.info.base);
                // console.log('destFolder', destFolder)
                var fileName = file.info.base;
                var destination = destFolder + '/' + fileName;
                var destFolderName = fileName.substring(0,8);
                if(!foldersToMakeVideo.hasOwnProperty(destFolderName)){
                    foldersToMakeVideo[destFolderName] = [];
                }
                foldersToMakeVideo[destFolderName].push(destination);

                // todo add file processing to queue
                _this.queue.push({
                    action: 'singleFile',
                    id: fileName,
                    file: source,
                    dest: destFolder + '/' + fileName,
                    last: _this.outFolder + 'last.jpg',
                    ftpDestFolder: '/htdocs/mikhailichenko.su/www/assets/',
                    ftpFileName: 'camera' + _this.config.cameraNumber + '.jpg'
                }, function (err, result){
                    if( err ){
                        console.log(err);
                    } else {
                        console.log('Single file processing is finished. File ' + fileName);
                        console.log(result);
                    }
                });

                _fsu.copyFile(source, destination,
                    function(err) {
                        if(err) {
                            console.log(err);
                        } else {

                            _fs.unlink(source, function(error) {
                                if (error) {
                                    throw error;
                                }
                                console.log('File ' + source + ' deleted.');
                            });

                            --_this.onceCount;
                            console.log('this.onceCount=', _this.onceCount);
                            if(_this.onceCount === 0){
                                _this.queue.resume();
                                _this.makeDayVideoOnce();
                            }
                        }
                    }
                );

            });
            console.log(_this.queue);
            _this.queue.push({
                action: 'makeDayVideo'
            }, function (err, result){
                if( err ){
                    console.log(err);
                } else {
                    console.log('Single file processing is finished.');
                    console.log(result);
                }
            });
            _this.resume();
        }

        this.foldersToMakeVideo = foldersToMakeVideo;
    };

    this.makeDayVideoOnce = function(cb){
        var count = 0;
        for (var ds in this.foldersToMakeVideo){
            if(this.foldersToMakeVideo.hasOwnProperty(ds)){
                count++;
            }
        }
        if( count === 0){
            cb();
            _this.startConcatVideoCycle();
        } else {
            var _this = this;
            for (var dateStamp in this.foldersToMakeVideo){
                if(this.foldersToMakeVideo.hasOwnProperty(dateStamp)){
                    // Delete TMP folder with single video if exist because all images went into day video by this function
                    var tmpFolderName = _path.join(this.outFolder,dateStamp,'tmp');
                    _fs.removeSync(tmpFolderName);
                    var dayVideoName = _path.join(this.outFolder,dateStamp,this.videoFileName);
                    var sourceFolder = _path.join(this.outFolder,dateStamp);
                    videoLib.createVideoBFromPath(sourceFolder, dayVideoName, function(output){
                        console.log(output);
                        count--;
                        if(count === 0){
                            console.log('Day videos are created');
                            cb();
                            _this.startConcatVideoCycle();
                        }
                    });
                    delete this.foldersToMakeVideo[dateStamp];
                }
            }
        }
    };

    this.startConcatVideoCycle = function(){
        console.log('Start concat video cycle.');
        var _this = this;
        setTimeout(function() {
            _this.concatVideo();
            _this.startConcatVideoCycle();
       }, _this.config.videoConcatPeriod);
    };

    this.concatVideo = function(){
        console.log('Do concat video', this.foldersToMakeVideo);
        var _this = this;
        for (var dateStamp in this.foldersToMakeVideo){
            if(this.foldersToMakeVideo.hasOwnProperty(dateStamp)){
                this.ensureDayVideoExists(dateStamp, function(ds){
                    _this.concatVideoInFolder(ds);
                });
                delete this.foldersToMakeVideo[dateStamp];
            }
        }
    };

    this.ensureDayVideoExists = function(dateStamp, cb){
        var destVideoName = _path.join(this.outFolder,dateStamp,this.videoFileName);
        if(_fs.existsSync(destVideoName)){
            cb(dateStamp);
        } else {
            var sourceFolder = _path.join(this.outFolder,dateStamp);
            var _this = this;
            videoLib.createVideoBFromPath(sourceFolder, destVideoName, function(output){
                /*
                var tmpFolderName = _path.join(_this.outFolder,dateStamp,'tmp');
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
        var _this = this;
        var sourceVideoFolder = _path.join(this.outFolder,dateStamp,'tmp');
        var tmpVideoName = _path.join(sourceVideoFolder,'tmp.mp4');
        _fs.readdir(sourceVideoFolder, function (err, list) {
            if (err){
                console.log('No TMP folder to scan: ' + tmpVideoName);
            } else {
                var newVideo = [];
                list.forEach(function (value) {
                    newVideo.push(_path.join(sourceVideoFolder, value));
                });
                console.log(newVideo);
                if(newVideo.length >0){
                    var destVideoName = _path.join(_this.outFolder,dateStamp,_this.videoFileName);
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
    
    this.makeSingleVideo = function(imageFileName, cb){
        var imageInfo = _path.parse(imageFileName);
        var tmpPath = _path.join(imageInfo.dir,'tmp');
        var videoFileName = _path.join(tmpPath,imageInfo.name + '.mp4');
        var _this = this;
        _fsu.ensureExists(tmpPath, 0777, function(err) {
            if (err) {
                throw err;
            } // handle folder creation error
            else {
                // console.log(imageFileName);
                videoLib.createVideoBFromImage(imageFileName, videoFileName, function(newFile){
                    var dateStamp = _path.basename(newFile).substring(0,8);
                    if(!_this.foldersToMakeVideo.hasOwnProperty(dateStamp)){
                        _this.foldersToMakeVideo[dateStamp] = [imageFileName];
                    }
                    _this.foldersToMakeVideo[dateStamp].push();
                    console.log(newFile+': new video file created.');
                    cb();
                });
            }
        });
    };

    this.addWatcher = function(){
        var _this = this;
        var destFolderRoot = this.outFolder;
        console.log('Set watcher for ' + this.inFolder);
        picSel.watch(this.inFolder, destFolderRoot, 'jpg', function (file, destFolderRoot) {
            'use strict';
            var fileName = _path.basename(file);
            var dest = _this.makeDestinationFolder(fileName);
            console.log("Need to copy file " + file + " to " + dest + '.');
            // todo add file processing to queue
            _this.queue.push({
                action: 'singleFile',
                id: fileName,
                file: file,
                dest: dest + '/' + fileName,
                last: destFolderRoot + '/' + 'last.jpg',
                ftpDestFolder: '/htdocs/mikhailichenko.su/www/assets/',
                ftpFileName: 'camera' + _this.config.cameraNumber + '.jpg'
            }, function (err, result){
                if( err ){
                    console.log(err);
                } else {
                    console.log('Single file processing is finished.');
                    console.log(result);
                }
            });
            /*
            _fsu.copyFile(file, dest + '/' + fileName, function (err) {
                if (err) {
                    console.log(err);
                }
                _this.makeSingleVideo(dest + '/' + fileName)
            });
            _fsu.copyFile(file, destFolderRoot + '/' + 'last.jpg', function (err) {
                if(err) {
                    console.log(err);
                }
                _fs.unlink(file, function (error) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('File ' + file + ' deleted.');
                    }
                });
                var ftpFileName = 'camera' + _this.config.cameraNumber + '.jpg';
                _ftpU.ftpPut(_this.config.ftpConfig, destFolderRoot + 'last.jpg','/htdocs/mikhailichenko.su/www/assets/', ftpFileName, function(err){
                    if(err) throw err;
                });
            });
            */
        });
    };

    this.makeDestinationFolder = function (file){
        var newDestName = this.outFolder + file.substring(0,8);
        _fsu.ensureExists(newDestName, 0777, function(err) {
            if (err) {
                throw err;
            }
            else {
            }
        });
        return newDestName;
    };

    return this;
};
