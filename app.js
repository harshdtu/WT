var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var FacebookUser = require('./models/facebookuser');
var LocalUser = require('./models/localuser');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
//var Auth = require('../authorization.js');
var FACEBOOK_APP_ID = "1683238675223733"
var FACEBOOK_APP_SECRET = "fd3d43bee8405f186bf701ade4bd500d";
var hash = require('./util/hash');

mongoose.connect("mongodb://localhost/ChemistApplication");

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);


//var users = require('./routes/users');
//require('./pport.js')(passport);

var app = express();
var server = require('http').createServer(app);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'SECRET'}));
app.use(passport.initialize());
app.use(passport.session());

//app.use('/', routes);
//app.use('/users', users);


//require('./routes/routes.js')(app, passport);





passport.use(new LocalStrategy(function(username, password, done){
    LocalUser.findOne({username: username}, function(err, user){
        if(err) {
          return done(err);
        }
        if(!user){
            return done(null, false, {message:'Incorrect username'}); 
        }
        
        hash(password, user.salt, function(err, hash){
            if(err){ return done(err);}
            if(hash == user.hash) return done(null, user);
            done(null, false, { message:'Incorrect password.'});
            
        });
    }); 
}));

passport.use(new FacebookStrategy({
      clientID:FACEBOOK_APP_ID,
      clientSecret:FACEBOOK_APP_SECRET,
      callbackURL:"http://localhost:3000/auth/facebook/callback",
      profileFields : ["id", "gender", "displayName", "email"]
    },
    function( accessToken, refreshToken, profile, done){
      console.log(profile);
      FacebookUser.findOne({fbId: profile.id}, function(err, oldUser){
        if(oldUser){
          done(null, oldUser);
        } else {
          var newUser = new FacebookUser({
            
            fbId: profile.id,
            email:profile.emails[0].value,
            name: profile.displayName
          }).save(function(err, newUser){
            if(err) throw err;
            done(null, newUser);
          });
        }
      });
    }
));

passport.serializeUser( function( user, done){
  done(null, user.id);
});

passport.deserializeUser( function(id, done){
  FacebookUser.findById(id, function(err, user){
    if(err) done(err);
    if(user){
      done(null, user);
    } else {
      LocalUser.findById(id, function(err, user){
        if(err) done(err);
        done(null, user);
      });
    }
  });
});



function authenticatedOrNot(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/login");
    }
}

function userExist(req, res, next) {
    LocalUser.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            // req.session.error = "User Exist"
            res.redirect("/singup");
        }
    });
}

app.get("/", function(req, res){ 
		if(req.isAuthenticated()){
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
	
	app.post("/signup", userExist, function (req, res, next) {
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
		passport.authenticate("facebook",{ failureRedirect: '/login',successRedirect:'/profile'}),
		function(req,res){
			res.render("profile", {user : req.user});
		}
	);
	
	app.get("/profile", authenticatedOrNot , function(req, res){ 
		res.render("profile", { user : req.user});
	});

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/login');
	});









server.listen(3000);






















































































































































































// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});


//module.exports = app;
