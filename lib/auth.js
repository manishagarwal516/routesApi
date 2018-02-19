"use strict";

var passport                = require('passport'),
	BasicStrategy           = require('passport-http').BasicStrategy,
    ClientPasswordStrategy  = require('passport-oauth2-client-password').Strategy,
    BearerStrategy          = require('passport-http-bearer').Strategy,
    LocalStrategy           = require('passport-local').Strategy,
    envVar                  = process.env.NODE_ENV,
    token                   = require('./token.js'),
	fs                      = require('fs'),
    yaml                    = require("js-yaml"),
    conf                    = yaml.load(fs.readFileSync('config/config.yml'));


// authenticate user/pass
passport.use(new LocalStrategy(
	function (username, password, done) {
		console.log('LocalStrategy');

		// userModel.getByLoginPass(username, password, function(err, user) {
		// 	if (err) { return done(err); }
		// 	if (!user) { return done(null, false); }
		// 	return done(null, user);
		// });
	}
));

// client login / password authentication
passport.use(new BasicStrategy(
	function(username, password, done) {
		console.log('BasicStrategy');

		// userModel.getByLoginPass(username, password, function(err, user) {
		// 	if (err) { return done(err); }
		// 	if (!user) { return done(null, false); }

		// 	console.log('completed BasicStrategy');
		// 	return done(null, user);
		// });
	}
));

// OAuth2 style client id/secret
passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
	    console.log('ClientPasswordStrategy');
	    console.log('clientId:'+clientId+' clientSecret:'+clientSecret);

	    // validate credentials against settings
	    if (clientId !== conf[envVar].clientId) {
		    return done('Bad clientId given');
	    } else if (clientSecret !== conf[envVar].clientSecret) {
		    return done('Invalid clientSecret');
	    }

	    var client = {
		    'clientId': clientId,
		    'clientSecret': clientSecret,
		    'clientName': 'Api'
	    };
	    console.log('completed ClientPasswordStrategy');
	    return done(null, client);
	}
));

// normal token validation on API requests
passport.use(new BearerStrategy(
    function(accessToken, done) {
	    //console.log('BearerStrategy', 'access_token', accessToken);
	    var tokenData = "access_token-" + accessToken;
	    console.log(token);
	    token.findAccess(tokenData, function(err, result) {
		    if (err) { return done('Failed to find access token record. '+err); }
		    if (result === undefined) { return done(null, false); }

		    // oauthToken.updateAccess(accessToken, token, function(err) {
			   //  if (err) { return done('Failed to update access token. '+err); }
		    // });
		    // //console.log('tokenData', token);
		    // oauthToken.closeMem();
		    // console.log('completed BearerStrategy');
		    done(null, result);
	    });
    }
));

/*passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  db.users.find(id, function (err, user) {
    done(err, user);
  });
});
*/