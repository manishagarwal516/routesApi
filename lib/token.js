var Memcached           = require('memcached'),
    fs                  = require('fs'),
    yaml                = require('js-yaml'),
    conf                = yaml.load(fs.readFileSync('config/config.yml')),
    envVar              = process.env.NODE_ENV,
	uuid                = require('node-uuid');
console.log(conf);
var memcached   = new Memcached(conf[envVar].memcached.server+':'+conf[envVar].memcached.port, {retries:1, retry:1});

var token = {
	getToken: function(tokenType, res) {
		var type = (tokenType === 'access' ? 'access_token-' : 'refresh_token-');
		var run = true;
		var guid = uuid.v4();

		async.whilst(
			function() { return run; },
			function(cb) {
				guid = uuid.v4();
				memcached.get(type+guid, function(err, ret) {
					if (err) {
						console.log('Got an error ', err);
						return cb('An error occurred. '+err); }
					console.log('return', ret);
					if (ret === undefined) {
						console.log('hit stop point', guid);
						run = false;
						cb(null, guid);
					}
				});
			},
			function(err, uid) {
				if (err) { console.log("ERROR: ", err); return res('Error geting UUID. '+err); }
				res(null, guid);
			}
		);
	},
	newToken: function(tokenType, data, res) {
		if (tokenType !== 'access' && tokenType !== 'refresh') { return res('Invalid token type requested.'); }

		var guid = uuid.v4();
		var newToken = (tokenType == 'access' ? 'access_token-' : 'refresh_token-')+guid;
		var newData = JSON.stringify(data[0]);
		console.log(newToken);
		memcached.get(newToken, function(err, tokenData) {
			if (err) {
				console.log('Failure checking token '+newToken);
				return res('Failed to check token. '+err); }
			if (!tokenData) {
				memcached.set(newToken, newData, 2, function(err) {
					console.log("err");
					if (err) {
						console.log('Failed to create new token record');
						return res(err); }
					res(null, guid);
				});
			} else {
				token.newToken(tokenType, data, function(err, ret) {
					if (err) { return res(err); }
					res(null, ret);
				});
			}
		});
	},
	findAccess: function(accessToken, res) {
		memcached.get(accessToken, function(err, ret) {
			if (err) {
				console.log('Got an error ', err);
				return res('An error occurred. '+err); }

			if (ret === undefined) {
				run = false;
				res(null, accessToken);
			}
		});
	},
	deleteAccess: function(accessToken, res) {
		memcached.del('access_token-'+accessToken, function(err) {
			if (err) { return res('Failed to delete access token. '+err); }
			res(null, 'success');
		});
	},
}	

module.exports = token; 