const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../models/User');
const User = mongoose.model('users');

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email'}, (email, password, done)=>{
        User.findOne({email: email}).lean().then((user)=>{
            if(!user){
                return done(null, false, {message: "This account doesn't exist"});
            }


            bcrypt.compare(password, user.password, (err, equals)=>{
                if(equals){
                    return done(null, user);
                }else{
                    return done(null, false, {message: "Incorrect password"});
                }
            });
        }).catch((err)=>{

        });
    }));

    passport.serializeUser((user, done)=>{
        done(null, user);
    });
    passport.deserializeUser((id, done)=>{
        
        User.findById(id).lean().then((user)=>{
            done(null, user);
        }).catch((err)=>{
            done(err, false, {message: "something went wrong"});
        });
   

    });
}