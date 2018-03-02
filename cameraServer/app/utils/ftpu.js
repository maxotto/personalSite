var ftpClient = require('ftp');
var fs = require('fs');
function ftpPut(config, sourceFile, destFolder,destFileName, cb){
    var c = new ftpClient();
    c.on('ready' ,function(sourceFile, destFolder,destFileName) {
        c.put(sourceFile, destFolder+destFileName, function(err){
            if (err) cb(err);
            c.end();
        })
    });
    c.connect(config);
}

module.exports.ftpPut = ftpPut;