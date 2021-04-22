const express      = require('express');
const User         = require('../../models/userSchema');
const sendEmail    = require('../controller/sendEmail');
const config       = require('../../config');
const router       = express.Router();

router.get('/confirmation', async (req, res) => {
    if(!req.user){
        res.redirect('/login');
        return;
    }
    if(req.user.confirm == true) {
        res.render('auth/confirmation', {error: 'You have already confirmed your email', pageType: 'Auth', css: 'auth/confirmation.css', title: 'Confirm Email - ' + config.title});
        return;
    }
    res.render('auth/confirmation', {error: null, pageType: 'Auth', css: 'auth/confirmation.css', title: 'Confirm Email - ' + config.title});
});


router.put('/confirmation', async (req, res) => {
    if(!req.user){
        res.redirect('/login');
        return;
    }
    if(req.user.confirm == true) {
        res.render('auth/confirmation', {error: 'You have already confirmed your email', pageType: 'Auth', css: 'auth/confirmation.css', title: 'Confirm Email - ' + config.title});
        return;
    }
    if(req.body.code !== req.user.confirmationCode){
        res.render('auth/confirmation', {error: `The code ${req.body.code} is incorrect`, pageType: 'Auth', css: 'auth/confirmation.css', title: 'Confirm Email - ' + config.title});
        return;
    }

    //For some reason .FoundByIdAndUpdate and .FoundOneAndUpdate wasn't working so I used this method to update the confirmation status.
    let foundUser = await User.findById(req.user.id);
    foundUser.confirm = true;
    foundUser.save();
    res.redirect('/');
});

router.put('/confirmation/newcode', async (req, res) => {
    if(!req.user){
        res.redirect('/login');
        return;
    }
    if(req.user.confirm == true) {
        res.render('auth/confirmation', {error: 'You have already confirmed your email', pageType: 'Auth', css: 'auth/confirmation.css', title: 'Confirm Email - ' + config.title});
        return;
    }
    let generateConfirmationCode = Math.floor(Math.random() * (999999 - 100000 + 1) ) + 100000;
    let foundUser = await User.findById(req.user.id);
    foundUser.confirmationCode = generateConfirmationCode;
    foundUser.save();
    //sendEmail()
    res.redirect('/confirmation');
})

module.exports = router;