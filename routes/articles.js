const express = require('express');
const router = express.Router();

// Bring In Article Model
let Article = require('../models/article');
// User Model
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('add_article', {
        title: ' Add Article'
    });
});

// Add Submit POST Route
router.post('/add', function (req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    //req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id; // this is the user object which we had when we logged in
        article.body = req.body.body;

        // Now we will save
        article.save(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            else {
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    // findding from MODELS
    Article.findById(req.params.id, function (err, article) {
        //console.log(article);
        if (article.author != req.user._id) {
            req.flash('danger', 'Not Authorized!');
            return res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});

// Update Submit POST Route
router.post('/edit/:id', function (req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { _id: req.params.id }

    // Now we will update
    Article.update(query, article, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

//DELETE Route
router.delete('/:id', function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }

    let query = { _id: req.params.id }

    // Making sure that the user own that article
    Article.findById(req.params.id, function (err, article) {
        if (article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.remove(query, function (err) {
                if (err) {
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });
});

// Get Single Article               // We moved it down because system was confusing ADD ROUTE with this Route
router.get('/:id', function (req, res) {  // because it was thinking that '/add' is the place holder i.e. '/:id'
    // findding from MODELS
    Article.findById(req.params.id, function (err, article) {
        //console.log(article);
        User.findById(article.author, function (err, user) {
            res.render('article', {
                article: article,
                author: user.name
            });
        });
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please Login!');
        res.redirect('/users/login');
    }
}

module.exports = router;