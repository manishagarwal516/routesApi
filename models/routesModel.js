var connector = require('./appModel'),
	ObjectID = require('mongodb').ObjectID,
	moment = require('moment'),
	_ = require('underscore'),
	async = require('async');

var routes = {
	create: function(data, res){
		if(Object.keys(data).length === 0) { return res("Please enter valid data"); }
		var errors = routes.validate(data);
		if(errors.length > 0){
			res(null,errors);
		}else{
			async.waterfall([
				function(callback) {
					var mongoSelectData = {
						"collection": "routes",
						"qry" : {"Imei":data.Imei, "Route_number": data.Route_number}
					}
					connector.mongoPool.query(mongoSelectData,function(err, result){
						callback(null, result);
					})
				},
				function(mongoResult,callback){
					if(mongoResult.length > 0){
						mongoResult[0].Location.push({
							"Lat": data.Lat,
							"Long": data.Long
						});
						var mongoUpdateData = {
							"collection": "routes",
							"qry":{
								condition : { "_id" : new ObjectID(mongoResult[0]["_id"])},
								values : { "Location" : mongoResult[0].Location }	
							}
						}
						connector.mongoPool.update(mongoUpdateData,function(err, result){
							callback(null, result);
						});
					}else{
						var mongoSaveData = {
							"collection": "routes",
							"qry":{
								"Accuracy": data.Accuracy,
								"Imei": data.Imei,
								"Direction": data.Direction,
								"Speed": data.Speed,
								"Distance": data.Distance,
								"Route_number": data.Route_number,
								"Phone_number": data.Phone_number,
								"Date_time": moment(data.Date_Time, "MM-DD-YYYYTHH:mm:ss").toDate(),
								"Location" : [{
									"Lat": data.Lat,
									"Long": data.Long
									}
								]
							}
						}
						console.log(moment(data.Date_Time, "MM-DD-YYYYTHH:mm:ss").toDate());
						connector.mongoPool.insert(mongoSaveData,function(err, result){
							callback(null, result);
						})
					}
				}
			],function(err,result){
					res(null,result);
			});
		}
	},

	getAction: function(data, projection, res){
		var errors = [],
		mongoSelectData = {
			"collection": "routes",
			"qry" : {},
			"projection": projection
		};

		if(!Object.keys(data) || Object.keys(data).length === 0) { res("Please enter valid search keys"); }
		for (var i = 0; i < Object.keys(data).length; i++) {
			if(searchKeys.indexOf(Object.keys(data)[i]) === -1) { errors.push('Invalid search key' + Object.keys(data)[i])}
			if(Object.keys(data)[i] != "Date_time"){
				mongoSelectData.qry[Object.keys(data)[i]] = {};
				mongoSelectData.qry[Object.keys(data)[i]]["$in"] = data[Object.keys(data)[i]].split(",");
			}else{
				console.log(Object.keys(data)[i].split(",")[0]);
				mongoSelectData.qry[Object.keys(data)[i]] = {};
				mongoSelectData.qry[Object.keys(data)[i]]["$gt"] = moment(data[Object.keys(data)[i]].split(",")[0], 'MM-DD-YYYY HH:mm').toDate();
				mongoSelectData.qry[Object.keys(data)[i]]["$lt"] = moment(data[Object.keys(data)[i]].split(",")[1], 'MM-DD-YYYY HH:mm').toDate();
			}	
		}
		console.log(mongoSelectData);
		if(errors.length > 0){
			res(errors);
		}else{
			connector.mongoPool.query(mongoSelectData,function(err, result){
				res(null, result);
			})
			
		}
	},

	liveLocation: function(data, projection, res){
		var errors = [],
		mongoSelectData = {
			"collection": "routes",
			"qry" : {},
			"sort" : {"Phone_number":1,"_id":-1},
			"projection": projection
		};

		if(!Object.keys(data) || Object.keys(data).length === 0) { res("Please enter valid search keys"); }
		for (var i = 0; i < Object.keys(data).length; i++) {
			if(searchKeys.indexOf(Object.keys(data)[i]) === -1) { errors.push('Invalid search key' + Object.keys(data)[i])}
			if(Object.keys(data)[i] != "Date_time"){
				mongoSelectData.qry[Object.keys(data)[i]] = {};
				mongoSelectData.qry[Object.keys(data)[i]]["$in"] = data[Object.keys(data)[i]].split(",");
			}
		}
		console.log(mongoSelectData);
		if(errors.length > 0){
			res(errors);
		}else{
			connector.mongoPool.query(mongoSelectData,function(err, result){
				res(null, result);
			})
			
		}
	},

	getDistinctPhoneNumber: function(data,res){
		var errors = [],
		mongoSelectData = {
			"collection": "routes",
			"distinct" : "Phone_number"
		};
		connector.mongoPool.query(mongoSelectData,function(err, result){
			console.log(result);
			res(null, result);
		})
	},

	validate: function(data){
		var errors = [];
		_.map(insertKeys, function(key){
			if(Object.keys(data).indexOf(key) === -1)
				errors.push(key + " is missing")
		});
		return errors;
	}

}

var searchKeys = ["Phone_number","Date_time"]
var insertKeys = ["Lat", "Accuracy", "Long", "Imei", "Direction", "Speed", "Distance", "Route_number", "Phone_number", "Date_Time"]
module.exports = routes;
