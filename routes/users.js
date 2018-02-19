var express = require('express');
var router = express.Router();
var user = require('../controllers/userController.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
  	user.register(req, function(data){
        res.send(data);
    });
});

router.post('/superadmin', function(req, res, next) {
  	user.addSuperadmin(req, function(data){
        res.send(data);
    });
});
module.exports = router;
