var yaml = require("js-yaml"),
	fs = require("fs"),
	me = yaml.load(fs.readFileSync("config/mongodb.yml")),
	envVar = process.env.NODE_ENV,
	Mongo = require('mongodb');
	mongoClient = Mongo.MongoClient;
	

var mongoPool = {
	query: function(mongo, res){
		var connectionStr = '';
		if (envVar == 'production') {
			connectionStr = "mongodb://" + me[envVar].username + ":" + me[envVar].password + "@" + me[envVar].host + ":" + me[envVar].port + "/" + me[envVar].db_name;
		} else {
			connectionStr = "mongodb://" + me[envVar].host + ":" + me[envVar].port + "/" + me[envVar].db_name;
		}
		var projection = {};
		var sort = {"_id":1}
		if (mongo.projection) {
			projection = mongo.projection;
		}

		if (mongo.sort) {
			sort = mongo.sort;
		}
		mongoClient.connect(connectionStr, function(err, db){
			if (err) {
				res('mongo connect err: '+JSON.stringify(err),null);
			} else {
					//console.log(mongo);
				if(mongo.qry){
					db.collection(mongo.collection).find(mongo.qry, projection).sort(mongo.sort).toArray(function(err, docs){
						db.close();
						res(err, docs);
					});
				}else{
					db.collection(mongo.collection).distinct(mongo.distinct, (function(err, docs){
			            console.log(docs);
			            //assert.equal(null, err);
			            res(err, docs);
			            db.close();
			        }))
				}
			}
		});
	},
	delete: function(mongo, res) {
		if (mongo.qry === undefined) { return res('Must define record to delete')}
		var connectionStr = '';
		if (envVar == 'production') {
			connectionStr = "mongodb://" + me[envVar].username + ":" + me[envVar].password + "@" + me[envVar].host + ":" + me[envVar].port + "/" + me[envVar].db_name;
		} else {
			connectionStr = "mongodb://" + me[envVar].host + ":" + me[envVar].port + "/" + me[envVar].db_name;
		}
		mongoClient.connect(connectionStr, function(err, db) {
			if (err) { return res('mongo connect err: ' + JSON.stringify(err), null); }
			db.collection(mongo.collection).remove(mongo.qry, function(err, docs) {
				db.close();
				res(err, docs);
			});
		});
	},
	insert: function(mongo, res){
		var connectionStr = '';
		if (envVar == 'production') {
			connectionStr = "mongodb://" + me[envVar].username + ":" + me[envVar].password + "@" + me[envVar].host + ":" + me[envVar].port + "/" + me[envVar].db_name;
		} else {
			connectionStr = "mongodb://" + me[envVar].host + ":" + me[envVar].port + "/" + me[envVar].db_name;
		}

		mongoClient.connect(connectionStr, function(err, db){
			console.log(mongo.collection, mongo.qry);
			db.collection(mongo.collection).insert(mongo.qry, function(err, result){
				db.close();
				var r;
				console.log(result);
				if(err){
					res(err);
				}else{
					r = {
						result: result[0]
					};
					res(err, r);
				}
			});
		});
	},
	update: function(mongo, res){
		var connectionStr = '';
		// var BSON = Mongo.BSONPure;
		// var objectId = new BSON.ObjectID(data.qry.Id);
		if (envVar == 'production') {
			connectionStr = "mongodb://" + me[envVar].username + ":" + me[envVar].password + "@" + me[envVar].host + ":" + me[envVar].port + "/" + me[envVar].db_name;
		} else {
			connectionStr = "mongodb://" + me[envVar].host + ":" + me[envVar].port + "/" + me[envVar].db_name;
		}
		mongoClient.connect(connectionStr, function(err, db){
			//console.log(data);
			db.collection(mongo.collection).update(mongo.qry.condition, {$set: mongo.qry.values},{'multi':true,'upsert':false}, function(err, result){
				db.close();
				var r;
				if(err){
					res(err);
				}else{
					if (result < 1) err = 'Mongo Record Not Updated.';
					r = {};
					res(err, r);
				}
			});
		});
	}
};

module.exports = {
	mongoPool: mongoPool
}