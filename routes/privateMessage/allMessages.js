const express       = require('express');
const User          = require('../../models/userSchema');
const config        = require('../../config');
const getEndPoint   = require('../controller/getEndPoint');
const getStartPoint = require('../controller/getStartPoint');
const router        = express.Router();


router.get('/messages', async (req, res) => {
    res.redirect('/messages/1');
});

router.get('/messages/:id', async (req,res) => {
    //Check if user is logged in 
    if(!req.user){
        res.redirect('/login');
        return;
    };
    foundUser = await User.findById(req.user.id).populate("privateMsg");
    let highestPageNumb = Math.ceil(foundUser.privateMsg.length / 20);
    if(highestPageNumb == 0){
        res.render('privateMessage/allMessages', {user: foundUser, user: foundUser, pageType: 'Main', css: 'privateMessage/allMessages.css', title: "All Messages - "  + config.title, isLogged: true, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1});
        return;
    };
    if(req.params.id2 > highestPageNumb){
        res.render('error', {error: 'The page number you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: true});
        return;
    };
    let startPoint = await getStartPoint(parseInt(req.params.id));
    let endPoint = await getEndPoint(foundUser.privateMsg , parseInt(req.params.id));
    res.render('privateMessage/allMessages', {user: foundUser, pageType: 'Main', css: 'privateMessage/allMessages.css', title: "All Messages - "  + config.title, isLogged: true, pageNumb: req.params.id, startPoint: startPoint, highestPageNumb: highestPageNumb, endPoint: endPoint, nextPage: (parseInt(req.params.id) + 1)});

});

module.exports = router;