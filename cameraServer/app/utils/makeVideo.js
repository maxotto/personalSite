var vl = require('./utils/videoLib');
var picSel = require('./utils/PictureSelector');
var fs = require('fs');
var fsu = require('./utils/fsu');
var path = require('path');
var outFile;
var checkNewFilesPeriod = 5*60*1000;

function run(inputFolder, outputFile){
    outFile = outputFile;
    var tmpVideoFolder = './tmp/';
    fs.rmdir(tmpVideoFolder, function(error) {
        if (error && error.code !== 'ENOENT') {
            console.log(error);
            throw error;
        }
        console.log('Folder ' + tmpVideoFolder + ' deleted.');
        fsu.ensureExists(tmpVideoFolder, 0777, function(err) {
            if (err) {
                throw err;
            } // handle folder creation error
            else {
                vl.createVideoBFromPath(inputFolder, outFile, function(output){
                    console.log('Video created in:', output);
                    start();
                    picSel.watch('../data/camera1/20180218/','','jpg', function(fullPath, dest, ext){
                        var newFileInfo = path.parse(fullPath);
                        var newFileName = tmpVideoFolder + newFileInfo.name;
                        console.log(newFileName);
                        vl.createVideoBFromImage(fullPath, newFileName+'.mp4', function(newFile){
                            console.log(newFile+': new video file created.');
                        })
                    });
                });
            }
        });
    });
}
function concatVideo(){
    var extFilter = 'mp4';
    fs.readdir(tmpVideoFolder, function (err, list) {
        if (err){
            console.log(err);
        } else {
            console.log(list);
            var newVideo = [];
            list.filter(extension).forEach(function (value) {
                newVideo.push(tmpVideoFolder + value);
            });
            if(newVideo.length >0){
                vl.mergeVideo(outFile, newVideo, './tmp.mp4', function(){
                    fs.unlink(outFile, function(error) {
                        if (error) {
                            throw error;
                        }
                        fs.rename('./tmp.mp4',outFile, function(error){
                            if (error) {
                                throw error;
                            }
                            console.log('File ' + outFile + ' rewritten.');
                        });
                    });
                    newVideo.forEach(function(file){
                        fs.unlink(file, function(error) {
                            if (error) {
                                throw error;
                            }
                            console.log('File ' + file + ' deleted.');
                        });
                    })

                    /*
                    fs.unlink(newFile, function(error) {
                        if (error) {
                            throw error;
                        }
                        console.log('File ' + newFile + ' deleted.');
                    });
                    */
                });
            }
        }
    });
    function extension(element) {
        var extName = path.extname(element);
        return extName === '.' + extFilter;
    }
}
function start() {
    setTimeout(function() {
        concatVideo();
        start();

        // Every 3 sec
    }, checkNewFilesPeriod);
}

module.exports.run = run;
