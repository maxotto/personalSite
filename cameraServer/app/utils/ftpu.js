var ftpClient = require('ftp');
var fs = require('fs');
function ftpPut(config, sourceFile, destFolder,destFileName, cb){
    var c = new ftpClient();
    console.log(sourceFile);
    c.on('ready' ,function() {
        console.log('connected');

        c.put(sourceFile, destFolder+destFileName, function(err){
            if (err) cb(err);
            c.end();
        })

    });
    c.on('error', function(err){
        throw err;
    });
    c.connect(config);
}

module.exports.ftpPut = ftpPut;