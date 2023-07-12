const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
require("../models/User");
const User = mongoose.model('users');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//errors treatment
    function findErrorsSignUp(name, email, password, repeat){
        var errors = [];
        if(!name || typeof name ==undefined || name == null){
                errors.push({texto: "Invalid name"});
        }else if(name.length<2){
            errors.push({texto: "name too small"});
        }
        if(!email || typeof email ==undefined || email == null){
            errors.push({texto: "Invalid email"});
        }
        if(!password || typeof password ==undefined || password == null){
            errors.push({texto: "Invalid password"});
        }else if(password.length<6){
            errors.push({texto: "Password too small"});
        }
        if(!repeat || typeof repeat ==undefined || repeat == null){
            errors.push({texto: "Invalid Repeated password"});
        }else if(repeat != password){
            errors.push({texto: "Passwords are not the same"})
        }
        return errors;
    }


router.get('/', (req, res)=>{
    res.send('Pagina de usuario');
});
router.get('/signup', (req, res)=>{
    res.render('user/signup');
});
router.post('/signup', (req, res)=>{
    var errors = findErrorsSignUp(req.body.name, req.body.email, req.body.password, req.body.repeat);
    const paramsUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        repeat: req.body.repeat
    };
    if(errors.length > 0){
        res.render('user/signup', {errors: errors, user: paramsUser});                 
    }else{
        User.findOne({email: req.body.email}).lean().then((user)=>{
            if(!user){
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(req.body.password, salt, function(err, hash){
                        if(!err){
                            newUser.password = hash;
                            newUser.save().then(()=>{
                                req.flash("success_msg", "Sign up made with successfully");
                                res.redirect("/");
                            }).catch((err)=>{
                                req.flash("error_msg", "An error occurred while saving the account");
                                res.redirect("/");
                            });
                        }else{
                            req.flash("error_msg", "An error occurred while processing hash");
                            console.log(err);
                            res.redirect('/');
                        }
                    });
                });


            }else{
                errors.push({texto: "The email already exist in our database"});
                res.render('user/signup', {errors: errors, user: paramsUser});  
            }
        }).catch((err)=>{
            req.flash("error_msg", "An error occurred while finding email");
            res.redirect("/");
        })
    }
});
router.get('/login', (req, res)=>{
    res.render('user/login');
});
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/user/login",
        failureFlash: true
    })(req, res, next);
});
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        req.flash('success_msg', "logged out user")
        res.redirect("/")
    })
})


module.exports = router;