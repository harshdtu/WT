var mongoose = require('mongoose');
var hash = require('../util/hash');
var LocalUserSchema = new mongoose.Schema({
	name: String,
	salt: String,
	hash: String,
	email: String
});

LocalUserSchema.statics.signup = function(email, username, password, done){
	var User = this;
	hash(password, function(err, salt, hash){
		if(err) throw err;
		// if (err) return done(err);
		User.create({
			name : username,
			salt : salt,
			hash : hash,
			email: email
			
		}, function(err, user){
			if(err) throw err;
			// if (err) return done(err);
			done(null, user);
		});
	});
}



var LocalUsers = mongoose.model('userauths', LocalUserSchema);



module.exports = LocalUsers;