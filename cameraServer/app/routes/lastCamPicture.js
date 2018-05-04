var express = require('express');
var router = express.Router();

/* GET lastCamPicture. */
router.get('/', function(req, res, next) {
    console.log(req.query.id);
    //res.send('Response send to client::'+req.query.id);
    var options = {
        root: __dirname + '/../../web-camera-storage/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    var filename = 'camera'+req.query.id+'/last.jpg';
    console.log(filename);

    res.sendFile(filename, options, function (err) {
        if (err) {
            console.error(err);
            next(err);
        } else {
            console.log('Sent:', filename);
        }
    });
});

module.exports = router;
