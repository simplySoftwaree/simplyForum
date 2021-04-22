const express    = require('express');
const passport   = require('passport')
const User       = require('../../models/userSchema');
const config     = require('../../config');
const createUser = require('./controller/createUser');
const router     = express.Router();


router.get('/admin/signup', async (req, res) =>{
    let isAdmin = await User.findOne({role: "Admin"});
    if(isAdmin){
        res.redirect('/user/signup');
    }else{
        res.render('auth/signup', {error: null, pageType: 'Auth', css: 'auth/signup.css', title: 'Signup - ' + config.title, type: 'admin/signup'});
    }
});

router.post('/admin/signup', async (req, res) =>{
    await createUser(req, res, "Admin", true);
});

router.get('/user/signup', async (req, res) =>{
    res.render('auth/signup', {error: null, pageType: 'Auth', css: 'auth/signup.css', title: 'Signup - ' + config.title, type: 'user/signup'});
});

router.post('/user/signup', async (req, res) =>{
    await createUser(req, res, "User", false);
});


router.get('/login', async (req, res) =>{
    res.render('auth/login', {error: null, pageType: 'Auth', css: 'auth/login.css', title: 'Login - ' + config.title, type: 'login'});
});


router.post('/login',
  passport.authenticate('local', { 
      successRedirect: '/',
      failureRedirect: '/login/failed' 
    }
));

router.get("/logout", async (req, res) =>{
    req.logout();
    res.redirect("/");
});


router.get('/login/failed', async (req, res) =>{
    res.render('auth/login', {error: 'The username or password were incorrect', pageType: 'Auth', css: 'auth/login.css', title: 'Login - ' + config.title, type: 'login'});
});


module.exports = router;