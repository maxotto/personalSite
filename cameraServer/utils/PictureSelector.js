var watchr = require('watchr');
var fs = require('fs');
var fsu = require('./fsu');
module.exports = {
    watch: function (path, dest) {
        function next (err) {
            if ( err )  return console.log('watch failed on', path, 'with error', err);
            console.log('watch successful on', path);
        }
        function listener (changeType, fullPath, currentStat, previousStat) {
            switch ( changeType ) {
                case 'update':
                    // console.log('the file', fullPath, 'was updated', currentStat, previousStat);
                    break;
                case 'create':
                    console.log('the file', fullPath, 'was created', currentStat);
                    fsu.copyFile(
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
                    // console.log('the file', fullPath, 'was deleted', previousStat);
                    break
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


