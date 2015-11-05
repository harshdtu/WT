var mongoose = require('mongoose');
var hash = require('../util/hash');
var LocalUserSchema = new mongoose.Schema({
	username: String,
	salt: String,
	hash: String
});

LocalUserSchema.statics.signup = function(username, password, done){
	var User = this;
	hash(password, function(err, salt, hash){
		if(err) throw err;
		// if (err) return done(err);
		User.create({
			username : username,
			salt : salt,
			hash : hash
		}, function(err, user){
			if(err) throw err;
			// if (err) return done(err);
			done(null, user);
		});
	});
}



var LocalUsers = mongoose.model('userauths', LocalUserSchema);



module.exports = LocalUsers;