var nodemailer = require('nodemailer'),
	constants = require('../lib/constants.js');

var email = {
	sendMail : function(to, subject, text, html, callback){
		mailOptions = email.createMailOptions(to, subject, text, html);
		var smtpTransport = "smtps://" + constants.SMTP_USERNAME + ":" + constants.SMTP_PASSWORD + "@" + constants.SMTP_HOST ; 
		var transporter = nodemailer.createTransport(smtpTransport);
		transporter.sendMail(mailOptions, function(error, info){
			console.log(error, info);
		    if(error){
		        callback(error);
		    }else{
		    	callback(null, "email Send Succesfully");
		    }
		});
	},
	createMailOptions : function(to, subject, text, html){
		var mailOptions = {
		    from: constants.SMTP_USERNAME + '@gmail.com',
		    to: to,
		    subject: subject,
		    text: text,
		    html: html
		}  
		return mailOptions;  
	}
}
module.exports = email;