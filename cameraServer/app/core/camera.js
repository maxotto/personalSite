var _fs = require('fs-extra');
var videoLib = require('../utils/videoLib');
var picSel = require('../utils/PictureSelector');
var _fsu = require('../utils/fsu');
var _path = require('path'); //require node path module (a couple of tools for reading path names)
var _walk = require('walkdir');
var _ftpU = require('../utils/ftpu');
var _queue = require('better-queue', { concurrent: 1 });

module.exports = function(config){
    var _this = this;
    // initilization
    this.config = config;
    this.onceCount = 0;
    this.foldersToMakeVideo = {};
    this.inFolder = this.config.inRoot + 'camera' + this.config.cameraNumber + '/';
    this.outFolder = this.config.outRoot + 'camera' + this.config.cameraNumber + '/';
    this.extFilter = this.config.extFilter;
    this.videoFileName = 'cam' + this.config.cameraNumber + 'Video.mp4';
    this.log = function(){
        console.log('Camera ' + this.config.cameraNumber + ': ', ...arguments);
    };
    this.queue = new _queue(function (task, cb) {
        _this.log('Task started.');
        if ( !task.hasOwnProperty('action') ){
            _this.log('Action is undefined.');
            _this.log(task);
        } else {
            _this.log('Going to start "' + task.action + '" action.');
            switch (task.action) {
                case 'init':
                    _this.init();
                    break;
                case 'singleFile':

                    break;
                case 'makeDayVideo':

                    break;
                case 'concatVideo':

                    break;
                default:
                    _this.log('No function set for "' + task.action + ' action.');
            }
        }
        cb('Task finished.');
    });

    this.resume = function(){
        _this.log('Queue resumed.');
        this.queue.resume();
    };

    this.pause = function(){
        _this.log('Queue paused.');
        this.queue.pause();
    };

    _this.log('Start camera' + this.config.cameraNumber);
    _this.log('In folder is ' + this.inFolder);
    this.pause();
    // кладем в очередь начальное задание
    this.queue.push({action: 'init'},function(e){
        _this.log(e);
    });
    this.watch = function(){
        // Стартуем, первым исполнится начальное задание
        // Оно, по мере необходимости, добавит в очередь другие задания
        // А также выставит watcher на входную папку
        this.resume();
    };

    /**
     * Проинициализировать начальное состояние
     * Повесить watcher на входную папку
     */
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
        // console.log({found});
        _this.log('this.onceCount=', this.onceCount);
        if(found.length === 0){
            // inFolder is empty. Just start concatinating cycle for new video files
            _this.resume();
            this.startConcatVideoCycle();
        } else {
            this.foldersToMakeVideo = {};
            found.forEach(function(file){
                _this.log(file.info.base);
                var source = file.fileFullName;
                var destFolderName, destinationFile;
                var d = _this.makeDestinationFolder(file.info.base);
                destFolderName = d.destFolderName;
                destinationFile = d.destinationFile;
                if(!_this.foldersToMakeVideo.hasOwnProperty(destFolderName)){
                    _this.foldersToMakeVideo[destFolderName] = [];
                }
                _this.foldersToMakeVideo[destFolderName].push(destinationFile);
                _this.log({destFolderName}, {destinationFile})
            });
            _this.log(_this.foldersToMakeVideo);
        }
    };

    this.makeDestinationFolder = function (file){
        var fileName = file;
        var destFolderName = fileName.substring(0,8);
        var newDestName = this.outFolder + destFolderName;
        _fsu.ensureExists(newDestName, 0o777, function(err) {
            if (err) {
                throw err;
            }
            else {
            }
        });
        var destinationFile = newDestName + '/' + fileName;
        return {
            destFolderName: destFolderName,
            destinationFile: destinationFile
        };
    };

    this.startConcatVideoCycle = function(){
        this.log('Start concat video cycle.');
        var _this = this;
        setTimeout(function() {
            // _this.concatVideo();
            // _this.startConcatVideoCycle();
            _this.log('Concat video cycle run.');
        }, _this.config.videoConcatPeriod);
    };
    return this;
};