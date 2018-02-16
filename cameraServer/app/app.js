var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*
var picSel1 = require('./utils/PictureSelector');
picSel1.watch('C:/watch/cam1','C:\\Users\\amihailichenko\\Desktop\\NodeJs tests\\camPicturePulisher\\public\\images\\cam1.jpg');
var picSel2 = require('./utils/PictureSelector');
picSel2.watch('C:/watch/cam2','C:\\Users\\amihailichenko\\Desktop\\NodeJs tests\\camPicturePulisher\\public\\images\\cam2.jpg');
*/

var fsu = require('./utils/fsu');

var
    sourceFolder = '/usr/src/cameraServer/web-camera-in/camera2',
    destFolderRoot = '/usr/src/cameraServer/web-camera-storage/camera2',
    extension = 'jpg';

fsu.processCameraPictures(sourceFolder, destFolderRoot, extension);
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

sourceFolder = '/usr/src/cameraServer/web-camera-in/camera1';
destFolderRoot = '/usr/src/cameraServer/web-camera-storage/camera1';
extension = 'jpg';
fsu.processCameraPictures(sourceFolder, destFolderRoot, extension);
var picSel2 = require('./utils/PictureSelector');
picSel2.watch(sourceFolder, destFolderRoot, extension, function (file, destFolderRoot) {
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
module.exports = app;
