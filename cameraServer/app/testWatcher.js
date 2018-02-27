var fsu = require('./utils/fsu');
var fs = require('fs');
var path = require('path'); //require node path module (a couple of tools for reading path names)

var
    sourceFolder = 'c:\\camera_in',
    destFolderRoot = 'c:\\camera_out',
    extension = 'jpg';

var picSel1 = require('./utils/PictureSelector');
picSel1.watch(sourceFolder, destFolderRoot, extension, function (file, destFolderRoot) {
    var fileName = path.basename(file);
    var dest = fsu.makeDestinationFolder(file, destFolderRoot);
    console.log("Need to copy file "+file+" to "+dest+'.');
    fsu.copyFile(file, dest + '/' + fileName,
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
});
