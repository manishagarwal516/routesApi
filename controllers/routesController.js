var	routesModel = require('../models/routesModel'),
	_ = require('underscore'),
	moment = require('moment'),
	controller = require('./appController');

var routes = {
	postAction: function(req, res) {
		routesModel.create(req.body, function(err, data){
			controller.responsify(err, data, function(response){
				res(response);
			});
		});
	},

	getCodinates: function(req, res) {
		routesModel.getCodinates(req.params, function(err, data){
			controller.responsify(err, data, function(response){
				res(response);
			});
		});
	},

	getAction: function(req, res) {
		var projection = {
				"_id" : 0
			}
		routesModel.getAction(req.query, projection, function(err, routes){
			_.each(routes, function(location, key){
				var temp_data = location.Location;
				delete routes[key].Location;
				routes[key].destination = {};
				routes[key].destination['Long'] = temp_data[0].Long;
				routes[key].destination['Lat'] = temp_data[0].Lat;
				routes[key].source = {};
				routes[key].source['Long'] = temp_data[temp_data.length - 1].Long;
				routes[key].source['Lat'] = temp_data[temp_data.length - 1].Lat;	
				routes[key].Date_time = moment(routes[key].Date_time).format("DD-MM-YYYY   hh:mm:ss");
			})
			controller.responsify(err, routes, function(response){
				res(response);
			});
		});
	},

	getLiveLocation: function(req, res) {
		var projection = {
				"Imei" : 1,
				"Location" : 1,
				"_id" : 0
			}
		routesModel.liveLocation(req.query, projection, function(err, routes){
			var sortedRoutes = []
			var groupKeys = _.groupBy(routes, function(route){ return route.Imei; })
			_.each(Object.keys(groupKeys),function(value){
				sortedRoutes.push(groupKeys[value][0]);
			});
			//console.log(sortedRoutes);
			_.each(sortedRoutes, function(location, key){
				var temp_data = location.Location;
				sortedRoutes[key].Location = {};
				sortedRoutes[key].Location['Long'] = temp_data[temp_data.length - 1].Long;
				sortedRoutes[key].Location['Lat'] = temp_data[temp_data.length - 1].Lat;
			})
			//console.log(routes);
			controller.responsify(err, sortedRoutes, function(response){
				res(response);
			});
		});
	},
	getDistinctPhoneNumber: function(req, res) {
		routesModel.getDistinctPhoneNumber(req.body, function(err, data){
			controller.responsify(err, data, function(response){
				res(response);
			});
		});
	}
}

module.exports = routes;