var fs = require('fs-extra');
var path = require('path'); //require node path module (a couple of tools for reading path names)
const ABSPATH = path.dirname(process.mainModule.filename); // Absolute path to our app directory

module.exports.copyFile = copyFile;
module.exports.listDir = listDir;
module.exports.ensureExists = ensureExists;
module.exports.makeDestinationFolder = makeDestinationFolder;
module.exports.processCameraPictures = processCameraPictures;

function makeDestinationFolder(file, destFolderRoot) {
    var fileName = path.basename(file, '.' + path.extname(file));
    var newDestName = destFolderRoot + '/' + fileName.substring(0,8);
    ensureExists(newDestName, 0777, function(err) {
        if (err) {
            throw err;
        } // handle folder creation error
        else {
        }// we're all good
    });
    return newDestName;
}
function ensureExists(path) {
    return fs.ensureDir(path);
}
function copyFile (source, target) {
    return fs.copy(source, target);
}
function processCameraPictures(sourceFolder, destFolderRoot, extFilter) {
    fs.readdir(sourceFolder, function (err, list) {
        if (err){
            console.log(err);
        } else {
            if (typeof extFilter === 'undefined') {
                console.log('Extension does not set');
                list.forEach(function (value) {
                    console.log(value);
                    var file = sourceFolder + '/' + value;
                    fs.stat(file, generate_callback(file));
                });
            } else {
                console.log(list);
                list.filter(extension).forEach(function (value) {
                    console.log(value);
                    var file = sourceFolder + '/' + value;
                    fs.stat(file, generate_callback(file));
                });
            }
        }
    });
    function generate_callback(file) {
        return function(err, stats) {
            if (stats.isFile()) {
                var fileName = path.basename(file);
                var dest = makeDestinationFolder(file);
                copyFile(file, dest + '/' + fileName,
                    function(err) {
                        if(err) {
                            console.log(err);
                        }
                    });

                fs.unlink(file, function(error) {
                    if (error) {
                        throw error;
                    }
                    console.log('File ' + file + ' deleted.');
                });
            }
        }
    }

    function makeDestinationFolder(file) {
        var fileName = path.basename(file, '.' + path.extname(file));
        var newDestName = destFolderRoot + '/' + fileName.substring(0,8);
        ensureExists(newDestName, 0777, function(err) {
            if (err) {
                throw err;
            } // handle folder creation error
            else {
            }// we're all good
        });
        return newDestName;
    }

    function ensureExists(path, mask, cb) {
        if (typeof mask === 'function') { // allow the `mask` parameter to be optional
            cb = mask;
            mask = 0777;
        }
        fs.mkdir(path, mask, function(err) {
            if (err) {
                if (err.code === 'EEXIST') cb(null); // ignore the error if the folder already exists
                else cb(err); // something else went wrong
            } else cb(null); // successfully created folder
        });
    }
    function extension(element) {
        var extName = path.extname(element);
        return extName === '.' + extFilter;
    }
}

function listDir(path){
    var files = fs.readdirSync( ABSPATH + path ); // You can also use the async method
    var filesWithStats = [];
    if( files.length > 1 ) {
        var sorted = files.sort(function(a, b){
            var s1 = fs.statSync(ABSPATH + path + a);
            var s2 = fs.statSync(ABSPATH + path + b);
            return s1.ctime < s2.ctime;
        });
        sorted.forEach(function(file) {
            filesWithStats.push({
                filename: file,
                date: new Date(fs.statSync(ABSPATH + path + file).ctime),
                path: path + file
            });
        });
    } else {
        files.forEach(function(file) {
            filesWithStats.push({
                filename: file,
                date: new Date(fs.statSync(ABSPATH + path + file).ctime),
                path: path + file
            });
        });
    }
    return filesWithStats;
}


