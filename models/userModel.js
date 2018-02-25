var connector = require('./appModel'),
	ObjectID = require('mongodb').ObjectID,
	_ = require('underscore'),
	email = require('../lib/email.js'),
	uuid = require('node-uuid'),
	async = require('async');

var user = {
	create: function(data, res){
		console.log("Data received");
		console.log(data);
		if(Object.keys(data).length === 0) { return res("Please enter valid data"); }
		

		
		var mongoSelectData = {
			"collection": "user",
			"qry":{
				"username": data.username
			}
		}
		connector.mongoPool.query(mongoSelectData,function(err, result){
			if(result.length > 0){
				res("User Already exists");
			}else{
				var userData = {
					"collection": "user",
					"qry":{
						"username": data.username,
						"email_id": data.email_id,
						"password": data.password,
						"address" : data.address,
						"phone_number" : data.phone_number,
						"type": data.user_type

					}
				}
				if(data.user_type === "superadmin"){
					userData.qry.active = false;
					user.addSuperUser(userData, function(err, result){
						if(err){
							res(err);
						}else{
							res(null, result);
						}
					})
				}else{
					userData.qry.active = true;
					connector.mongoPool.insert(userData,function(err, result){
						if(err){
							res(err);
						}else{
							var insertId = result;
							res(null, insertId);
						}
					})
				}
			}
		})
	},

	addSuperUser: function(data, callback){
		connector.mongoPool.insert(data,function(err, mongoResult){
			if(err){
				callback(err);
			}else{
				var verificationUUID = uuid.v1();
				var userVerificationData = {
					"collection": "user_tokens",
					"qry":{
						"user_id": mongoResult.result[0],
						"verification_token" : verificationUUID
					}
				}

				connector.mongoPool.insert(userVerificationData,function(err, result){
					if(err){
						res(err);
					}else{
						user.sendEmail(data.qry.email_id, verificationUUID, function(err, result){
							console.log(err, result);
							if(err){
								callback(err);
							}else{
								var insertId = mongoResult.result;
								callback(null, insertId);
							}
						})
					}
				})
			}
		})
	},

	sendEmail : function(username, authToken, callback){
		console.log("In sendEmail");
		var to = username
		var subject = "Add Super User"
		var text = "http://ec2-13-126-65-82.ap-south-1.compute.amazonaws.com/#/superuser/confirmation/" + authToken;
		var html = "<a href =" + text + ">" + text + "</a>";

		email.sendMail(to, subject, text, html, function(err, emailResponse) {
			console.log(err, emailResponse);
			if(err) {
				callback(err)
			}else{
				callback(null, emailResponse);
			}		
		});
	},

	getByLoginPass: function(username, password, res){
		var mongoSelectData = {
			"collection": "user",
			"qry":{
				"username": username,
				"password": password,
				"active":true
			}
		};
		console.log(mongoSelectData);
		connector.mongoPool.query(mongoSelectData,function(err, result){
			console.log(err, result);
			res(null, result);
		})
	},

	addSuperadmin: function(data, res){
		async.waterfall([
			function(callback) {
				var mongoSelectData = {
					"collection": "user_tokens",
					"qry" : {"verification_token":data.verificationUUID}
				}

				connector.mongoPool.query(mongoSelectData,function(err, result){
					console.log(result);
					callback(null, result);
				})
			},
			function(mongoResult,callback){
				if(mongoResult.length > 0 && data.accept){
					var mongoUpdateData = {
						"collection": "user",
						"qry":{
							condition : { "_id" : new ObjectID(mongoResult[0]["user_id"])},
							values : { "active" : true }	
						}
					}
					connector.mongoPool.update(mongoUpdateData,function(err, result){
						callback(null, result);
					});
				}else if(!data.accept){
					callback(null, mongoResult);
				}else{
					callback("Request is expired");
				}
			},
			function(result, callback) {
				var mongoDeleteData = {
					"collection": "user_tokens",
					"qry" : {"verification_token":data.verificationUUID}
				}
				
				connector.mongoPool.delete(mongoDeleteData,function(err, result){
					console.log(result);
					callback(null, result);
				})
			},
		],function(err,result){
				res(err,result);
		});
	}

}

module.exports = user;
