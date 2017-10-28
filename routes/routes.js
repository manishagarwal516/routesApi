var express = require('express');
var router = express.Router();
var routes = require('../controllers/routesController.js');

/* GET users listing. */
router.post('/', function(req, res, next) {
  	routes.postAction(req, function(data){
        res.send(data);
    });
});

router.get('/', function(req, res, next) {
  	routes.getAction(req, function(data){
        res.send(data);
    });
});

router.get('/live', function(req, res, next) {
  	routes.getLiveLocation(req, function(data){
        res.send(data);
    });
});

router.get('/getDistinctPhoneNumber', function(req, res, next) {
  	routes.getDistinctPhoneNumber(req, function(data){
        res.send(data);
    });
});

module.exports = router;
