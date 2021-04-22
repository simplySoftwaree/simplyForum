const User        = require('../../../models/userSchema');
const sendEmail   = require('../../controller/sendEmail');
const config      = require('../../../config');
const checkSensor = require('./checkUserCensor');
const checkField  = require('../../controller/checkFields');
const passport    = require('passport');


module.exports = async (req, res, role, confirmation) => {
    if(role == "Admin"){
        let isAdmin = await User.findOne({role: "Admin"});
        if(isAdmin){
            res.redirect('/user/signup');
            return;
        }
    }
    let field      = [req.body.email, req.body.username, req.body.password];
    let isEmpty    = await checkField(field);
    if(isEmpty == true){
        if(role == "User"){
            res.render('user/signup', {error: 'One or more fields are empty', pageType: 'Auth', css: 'auth/signup.css', title: 'Signup - ' + config.title, type: 'user/signup'});
            return;
        }else{
            res.render('admin/signup', {error: 'One or more fields are empty', pageType: 'Auth', css: 'auth/signup.css', title: 'Signup - ' + config.title, type: 'admin/signup'});
            return;
        }
    }
    let isBanned = await checkSensor(req.body.username);
    if(isBanned == true){
        res.render('user/signup', {error: `The username ${req.body.username} contains a word that is banned!`, pageType: 'Auth', css: 'auth/signup.css', title: 'Signup - ' + config.title, type: 'user/signup'});
        return;
    }
    let isUsername = await User.findOne({usernmae: req.body.username});
    if(isUsername){
        res.render('user/signup', {error: `The username ${req.body.username} already exists`, pageType: 'Auth', css: 'auth/signup.css', title: 'Signup - ' + config.title, type: 'user/signup'});
        return;
    }
    let isEmail    = await User.findOne({email: req.body.email});
    if(isEmail){
        res.render('user/signup', {error: `The email ${req.body.email} already exists`, pageType: 'Auth', css: 'auth/signup.css', title: 'Signup - ' + config.title, type: 'user/signup'});
        return;
    }
    let generateConfirmationCode = Math.floor(Math.random() * (999999 - 100000 + 1) ) + 100000;
    let user = new User({email: req.body.email, username: req.body.username, role: role, confirm: confirmation, confirmationCode: generateConfirmationCode, reset: false, ban: false, mute:false, notificationEmail: true});
    let newUser = await User.register(user, req.body.password);
    if(role !== "Admin"){
        // sendEmail(newUser.email, 'Email confirmation', '<html></html><h1>Confirm Account</h1><br>Please confirm your account. <br> Your Code is' + generateConfirmationCode + '');
    }
    passport.authenticate("local")(req, res, () =>{
        if(role == "Admin"){
            res.redirect('/admin');
        }else{
            res.redirect('/');
        }
    });
}