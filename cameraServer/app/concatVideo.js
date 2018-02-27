const vl = require('./utils/videoLib');
var picSel = require('./utils/PictureSelector');
var fs = require('fs');
var fsu = require('./utils/fsu');
var path = require('path');
const outFile = 'video.mp4';
const tmpVideoFolder = './tmp/';

concatVideo();

function concatVideo(){
    const extFilter = 'mp4';
    fs.readdir(tmpVideoFolder, function (err, list) {
        if (err){
            console.log(err);
        } else {
            console.log(list);
            const newVideo = [];
            list.filter(extension).forEach(function (value) {
                newVideo.push(tmpVideoFolder + value);
            });
            if(newVideo.length >0){
                vl.concatVideo(outFile, newVideo);
                console.log('new files added');
            }
            list.filter(extension).forEach(function (value) {
                var file = tmpVideoFolder + value;
                //fs.stat(file, generate_callback(file));
            });
        }
    });
    function generate_callback(file) {
        return function(err, stats) {
            if (stats.isFile()) {

                fs.unlink(file, function(error) {
                    if (error) {
                        throw error;
                    }
                    console.log('File ' + file + ' deleted.');
                });

            }
        }
    }
    function extension(element) {
        var extName = path.extname(element);
        return extName === '.' + extFilter;
    }
}
