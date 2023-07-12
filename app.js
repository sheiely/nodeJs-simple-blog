//Loading modules
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodypParser = require('body-parser');
    const mongoose = require('mongoose');
    const admin = require('./routes/admin');
    const user = require('./routes/user');
    const app = express();
    const path = require('path');
    const session = require('express-session');
    const flash = require('connect-flash');
    require("./models/Category");
    require("./models/Post");
    const Category = mongoose.model('categories');
    const Post = mongoose.model('posts');
    const passport = require('passport');
    require('./config/auth')(passport);

//Configs
    //Sessions
    app.use(session({
        secret: "_spx_zk9j00ln2eev^_7(wubr-",
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());

    //MiddleWare
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
        next();
    });
    //Bodyparser
    app.use(bodypParser.urlencoded({extended:true}));
    app.use(bodypParser.json());
    //Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main',}));
    app.set('view engine', 'handlebars');
    //Path
    app.use(express.static(path.join(__dirname, 'public')));
    //Mongoose
    mongoose.connect('mongodb://127.0.0.1/blog').then(() => {
        console.log('Connected with MongoDB');
    }).catch((err) => {
        console.log('An erro occurred when tryng to connect with MongoDB: '+err);
    });

//Routes
    app.use('/admin', admin);
    app.use('/user', user);
    app.get('/', (req, res)=>{
        Post.find().lean().populate('category').sort({date: 'desc'}).then((posts)=>{
            res.render("index", {posts: posts});
            console.log(req.user);
        }).catch((err)=>{
            req.flash("error_msg", "An internal error occurred");
            res.redirect("/404");
        });
    });
    app.get('/post/:slug', (req, res)=>{
        Post.findOne({slug: req.params.slug}).lean().populate('category').then((post)=>{
            if(post){
                res.render("post/index", {post: post});
            }else{
                req.flash("error_msg", "This post doesn't exist");
                res.redirect("/")
            }
            
        }).catch((err)=>{
            req.flash("error_msg", "An internal error occurred");
            res.redirect("/404");
        });
    });
    app.get('/categories', (req, res)=>{
        Category.find().lean().sort({date: 'desc'}).then((categories)=>{
                res.render("categories/index", {categories: categories}); 
        }).catch((err)=>{
            req.flash("error_msg", "An error occurred while listing categories");
            res.redirect("/");
        });
    });
    app.get('/categories/:slug', (req, res)=>{
        Category.findOne({slug: req.params.slug}).lean().then((category)=>{
            if(category){
                Post.find({category: category._id}).lean().populate('category').then((posts)=>{
                    if(posts){
                        res.render("categories/posts", {posts: posts, category: category});
                    }else{
                        req.flash("error_msg", "This post doesn't exist");
                        res.redirect("/")
                    }
                    
                }).catch((err)=>{
                    req.flash("error_msg", "An internal error occurred");
                    res.redirect("/404");
                });
            }else{
                req.flash("error_msg", "Category doesn't exist");
                res.redirect("/");
            }
        }).catch((err)=>{
            req.flash("error_msg", "An error occurred while finding categories");
            res.redirect("/");
        });
    });
    app.get('/404', (req, res)=>{
        res.send("Error 404!");
    });
//Others
    const PORT = 8081;

    app.listen(PORT,()=>{
        console.log('Server running!');
    });


