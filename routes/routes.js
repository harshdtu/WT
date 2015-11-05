var FacebookUser = require('../models/facebookuser');
var LocalUser = require('../models/localuser');
var Auth = require('../authorization.js');

module.exports = function(app, passport){
  app.get("/", function(req, res){ 
		if(req.authenticatedOrNot()){
		  res.render("home", { user : req.user}); 
		}else{
			res.render("home", { user : null});
		}
	});
	
	app.get("/login", function(req, res){ 
		res.render("login");
	});
	
	app.post("/login" 
		,passport.authenticate('local',{
			successRedirect : "/",
			failureRedirect : "/login",
		})
	);
	
	app.get("/signup", function (req, res) {
		res.render("signup");
	});
	
	app.post("/signup", Auth.userExist, function (req, res, next) {
		LocalUser.signup(req.body.username, req.body.password, function(err, user){
			if(err) throw err;
			req.login(user, function(err){
				if(err) return next(err);
				return res.redirect("profile");
			});
		});
	});
	
	app.get("/auth/facebook", passport.authenticate("facebook",{ scope : "email"}));
	app.get("/auth/facebook/callback", 
		passport.authenticate("facebook",{ failureRedirect: '/login'}),
		function(req,res){
			res.render("profile", {user : req.user});
		}
	);
	
	app.get("/profile", Auth.authenticatedOrNot , function(req, res){ 
		res.render("profile", { user : req.user});
	});

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/login');
	});
	
	
}