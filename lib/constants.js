var commonConfigFile = require('../config/config.json'),
	constants = require('../lib/constants.js'),
	define = require("node-constants")(exports),
	env   = process.env.NODE_ENV;

define({
  SMTP_USERNAME          : commonConfigFile[env].smtp_username,
  SMTP_PASSWORD          : commonConfigFile[env].smtp_password,
  SMTP_HOST              : commonConfigFile[env].smtp_host
});