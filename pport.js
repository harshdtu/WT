var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy;
var FacebookUser = require('./models/facebookuser');
var LocalUser = require('./models/localuser');
var FACEBOOK_APP_ID = "1683238675223733"
var FACEBOOK_APP_SECRET = "fd3d43bee8405f186bf701ade4bd500d";
var hash = require('./util/hash');

module.exports = function(passport){
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
      callbackURL:"http://localhost:3000/auth/facebook/callback"
    },
    function( accessToken, refreshToken, profile, done){
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
}