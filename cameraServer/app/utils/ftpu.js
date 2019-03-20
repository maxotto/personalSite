var ftpClient = require('ftp');
var fs = require('fs');
function ftpPut(config, sourceFile, destFolder,destFileName, cb){
    var c = new ftpClient();
    c.on('ready' ,function() {
        console.log('Connected to FTP.');

        c.put(sourceFile, destFolder+destFileName, function(err){
            if (err) cb(err);
            console.log('File sent by FTP.');
            c.end();
            cb(null);
        })

    });
    c.on('error', function(err){
        throw err;
    });
    c.connect(config);
}

module.exports.ftpPut = ftpPut;