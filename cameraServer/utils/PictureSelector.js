var watchr = require('watchr');
var fs = require('fs');
module.exports = {
    watch: function (path, dest) {
        function next (err) {
            if ( err )  return console.log('watch failed on', path, 'with error', err);
            console.log('watch successful on', path);
        }
        function listener (changeType, fullPath, currentStat, previousStat) {
            switch ( changeType ) {
                case 'update':
                    console.log('the file', fullPath, 'was updated', currentStat, previousStat);
                    break;
                case 'create':
                    console.log('the file', fullPath, 'was created', currentStat);
                    copyFileToDestination(
                        fullPath,
                        dest,
                        function(err) {
                            if(err) {
                                console.log(err);
                            }
                        }
                    );
                    break;
                case 'delete':
                    console.log('the file', fullPath, 'was deleted', previousStat);
                    break
            }
        }
        function copyFileToDestination(source, target, cb) {
            var cbCalled = false;

            var rd = fs.createReadStream(source);
            rd.on("error", done);

            var wr = fs.createWriteStream(target);
            wr.on("error", done);
            wr.on("close", function(ex) {
                done();
            });
            rd.pipe(wr);

            function done(err) {
                if (!cbCalled) {
                    cb(err);
                    cbCalled = true;
                }
            }
        }
// Create the stalker for the path
        var stalker = watchr.create(path);

// Listen to the events for the stalker/watcher
// http://rawgit.com/bevry/watchr/master/docs/index.html#watcher
        stalker.on('change', listener);
//stalker.on('log', console.log);
        stalker.once('close', function (reason) {
            console.log('closed', path, 'because', reason);
            stalker.removeAllListeners()  // as it is closed, no need for our change or log listeners any more
        });

// Set the default configuration for the stalker/watcher
// http://rawgit.com/bevry/watchr/master/docs/index.html#Watcher%23setConfig
        stalker.setConfig({
            stat: null,
            interval: 5007,
            persistent: true,
            catchupDelay: 2000,
            preferredMethods: ['watch', 'watchFile'],
            followLinks: true,
            ignorePaths: ['.idea'],
            ignoreHiddenFiles: true,
            ignoreCommonPatterns: true,
            ignoreCustomPatterns: null
        });
        stalker.watch(next);
    }
};


