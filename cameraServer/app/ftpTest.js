var ftpU = require('./utils/ftpu');
var params = require('./config/parameters');
var ftpConfig = params.ftpConfig;
console.log(ftpConfig);
ftpU.ftpPut(ftpConfig,'M:\\cameraServer\\data\\camera1\\' + 'last.jpg','/htdocs/mikhailichenko.su/www/assets/', 'camera1.jpg', function(err){
    if(err) throw err;
});

ftpU.ftpPut(ftpConfig,'M:\\cameraServer\\data\\camera2\\' + 'last.jpg','/htdocs/mikhailichenko.su/www/assets/', 'camera2.jpg', function(err){
    if(err) throw err;
});
