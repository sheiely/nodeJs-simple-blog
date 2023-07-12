const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
require("../models/Category");
require("../models/Post");
const Category = mongoose.model('categories');
const Post = mongoose.model('posts');
const {isAdmin} = require("../helpers/isAdmin.js");

//functions
    function findErrorsCategories(name, slug){
        var errors = [];
        if(!name || typeof name ==undefined || name == null){
                errors.push({texto: "Invalid name"});
        }else if(name.length<2){
            errors.push({texto: "Category name too small"});
        }
        if(!slug || typeof slug ==undefined || slug == null){
                errors.push({texto: "Invalid slug"});
        }
        return errors;
    }
    function findErrorsPosts(tittle, slug, description, content, category){
        var errors = [];
        if(!tittle || typeof tittle ==undefined || tittle == null){
                errors.push({texto: "Invalid tittle"});
        }else if(tittle.length<2){
            errors.push({texto: "Post tittle too small"});
        }
        if(!slug || typeof slug ==undefined || slug == null){
                errors.push({texto: "Invalid slug"});
        }
        if(!description || typeof description ==undefined || description == null){
            errors.push({texto: "Invalid description"});
        }else if(description.length<2){
            errors.push({texto: "Post description too small"});
        }
        if(!description || typeof description ==undefined || description == null){
            errors.push({texto: "Invalid description"});
        }
        if(!content || typeof content ==undefined || content == null){
            errors.push({texto: "Invalid content"});
        }
        if(!category || typeof category ==undefined || category == null){
            errors.push({texto: "Invalid category"});
        }
        
        return errors;
    }

//routers
    
    router.get('/', isAdmin, (req, res)=>{
        res.render("admin/index");
    });
    //posts
        router.get('/posts',isAdmin, (req, res)=>{
            Post.find().lean().populate('category').sort({date: 'desc'}).then((posts)=>{
                res.render("admin/posts", {posts: posts});
            }).catch((err)=>{
                req.flash("error_msg", "An error occurred loading posts");
                res.redirect("/admin");
            });
            
        });
        router.get('/posts/add',isAdmin, (req, res)=>{
            Category.find().lean().then((categories)=>{
                res.render("admin/addpost", {categories: categories});
            }).catch((err)=>{
                req.flash("error_msg", "An error occurred loading form");
                res.redirect("/admin");
            })
            
        });
        router.post('/posts/new',isAdmin, (req, res)=>{
            var errors = findErrorsPosts(req.body.tittle, req.body.slug, req.body.description, req.body.content, req.body.category);
            if(errors.length > 0){
                    res.render('admin/addpost', {errors: errors});                 
            }else{
                const newPost = {
                    tittle: req.body.tittle,
                    slug: req.body.slug,
                    description: req.body.description,
                    content: req.body.content,
                    category: req.body.category
                };
                new Post(newPost).save().then(()=>{
                    req.flash('success_msg', "Post created successfully");
                    res.redirect('/admin/posts');
                }).catch((err)=>{
                    req.flash('error_msg', "An error occurred saving the post");
                    res.redirect('/admin');
                });
            }
        });
        router.get('/posts/edit/:id',isAdmin, (req, res)=>{
            Post.findOne({_id: req.params.id}).lean().then((post)=>{
                Category.find().lean().then((categories)=>{
                    res.render('admin/editpost', {post: post, categories: categories});
                }).catch((err)=>{
                    req.flash("error_msg", "An error occurred loading form");
                    res.redirect("/admin");
                })
            }).catch((err)=>{
                req.flash('error_msg', "This category doesn't exist");
                res.redirect('/admin/posts');
            });
            
        });
        router.post('/posts/edit',isAdmin, (req, res)=>{
            var errors = findErrorsPosts(req.body.tittle, req.body.slug, req.body.description, req.body.content, req.body.category);
            if(errors.length > 0){
                Post.findOne({_id: req.body.id}).lean().then((post)=>{
                    Category.find().lean().then((categories)=>{
                        res.render('admin/editpost', {post: post, categories: categories, errors: errors});
                    }).catch((err)=>{
                        req.flash("error_msg", "An error occurred loading form");
                        res.redirect("/admin");
                    })
                }).catch((err)=>{
                    req.flash('error_msg', "An error occurred while finding category");
                    res.redirect('/admin/categories');
                });              
            }else{
                Post.findOne({_id: req.body.id}).then((post)=>{
                    post.tittle = req.body.tittle;
                    post.slug = req.body.slug;
                    post.description = req.body.description;
                    post.content = req.body.content;
                    post.category = req.body.category;
                    post.save().then(()=>{
                        req.flash('success_msg', "Post edited with success");
                        res.redirect('/admin/posts');
                    }).catch((err)=>{
                        req.flash('error_msg', "An error occurred while editing the post");
                        res.redirect('/admin/posts');
                    });
                }).catch((err)=>{
                    req.flash('error_msg', "An error occurred while finding post");
                    res.redirect('/admin/posts');
                });
            }
        });
        router.post('/posts/delete',isAdmin, (req, res)=>{
            Post.deleteOne({_id: req.body.id}).then(()=>{
                req.flash('success_msg', "Post deleted with success");
                res.redirect('/admin/posts');
            }).catch((err)=>{
                req.flash('error_msg', "An error occurred while deleting post");
                res.redirect('/admin/posts');
            })
        });

    //categories
        router.get('/categories',isAdmin, (req, res)=>{
            Category.find().sort({date: 'desc'}).lean().then((categories)=>{
                res.render("admin/categories", {categories: categories});
            }).catch((err)=>{
                req.flash("error_msg", "An error occurred finding categories");
                res.redirect("/admin");
            });
            
        });
        router.get('/categories/add',isAdmin, (req, res)=>{
            res.render("admin/addcategories");
        });

        router.post('/categories/new',isAdmin, (req, res)=>{
            var errors = findErrorsCategories(req.body.name, req.body.slug);
            if(errors.length > 0){
                    res.render('admin/addcategories', {errors: errors});                 
            }else{
                const newCategory = {
                    name: req.body.name,
                    slug: req.body.slug
                };
                new Category(newCategory).save().then(()=>{
                    req.flash('success_msg', "Category created successfully");
                    res.redirect('/admin/categories');
                }).catch((err)=>{
                    req.flash('error_msg', "An error occurred saving the category");
                    res.redirect('/admin');
                });
            }
        });

        router.get('/categories/edit/:id',isAdmin, (req, res)=>{
            Category.findOne({_id: req.params.id}).lean().then((category)=>{
                res.render('admin/editcategories', {category: category});
            }).catch((err)=>{
                req.flash('error_msg', "This category doesn't exist");
                res.redirect('/admin/categories');
            });
            
        });

        router.post('/categories/edit',isAdmin, (req, res)=>{
            var errors = findErrorsCategories(req.body.name, req.body.slug);
            console.log(errors);
            if(errors.length > 0){
                Category.findOne({_id: req.body.id}).lean().then((category)=>{
                    console.log(category);
                    res.render('admin/editcategories', {errors: errors, category: category});
                }).catch((err)=>{
                    req.flash('error_msg', "An error occurred while finding category");
                    res.redirect('/admin/categories');
                });
                    
            }else{
                Category.findOne({_id: req.body.id}).then((category)=>{
                    category.name = req.body.name;
                    category.slug = req.body.slug;
                    category.save().then(()=>{
                        req.flash('success_msg', "Category edited with success");
                        res.redirect('/admin/categories');
                    }).catch((err)=>{
                        req.flash('error_msg', "An error occurred while editing the category");
                        res.redirect('/admin/categories');
                    });
                }).catch((err)=>{
                    req.flash('error_msg', "An error occurred while finding category");
                    res.redirect('/admin/categories');
                });
            }
        });
        router.post('/categories/delete',isAdmin, (req, res)=>{
            Category.deleteOne({_id: req.body.id}).then(()=>{
                req.flash('success_msg', "Category deleted with success");
                res.redirect('/admin/categories');
            }).catch((err)=>{
                req.flash('error_msg', "An error occurred while deleting category");
                res.redirect('/admin/categories');
            })
        });








module.exports = router;