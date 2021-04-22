const express        = require('express');
const User           = require('../../models/userSchema');
const config         = require('../../config');
const getEndPoint    = require('../controller/getEndPoint');
const getStartPoint  = require('../controller/getStartPoint');
const privateMessage = require('../../models/privateMessageSchema');
const router         = express.Router();


router.get('/message/:id/:id2', async (req, res) => {
    if(!req.user){
        res.redirect('/login');
        return;
    }
    try {
        let foundMsg = await privateMessage.findById(req.params.id);
        let highestPageNumb = Math.ceil(foundMsg.privateMessageComment.length / 20);
        if(highestPageNumb == 0){
            res.render('privateMessage/message', {error: null, msg: foundMsg, pageType: 'Main', css: 'privateMessage/message.css', title: foundMsg.title + " - "  + config.title, isLogged: true, user: req.user, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1});
            return;
        };
        //If page number is the search bar is larger than highestPageNumb, if it is than redirect to error page
        if(req.params.id2 > highestPageNumb){
            res.render('error', {error: 'The page number you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: true, user: req.user});
            return;
        };
        let startPoint = await getStartPoint(parseInt(req.params.id2));
        let endPoint = await getEndPoint(foundMsg.privateMessageComment , parseInt(req.params.id2));
        res.render('privateMessage/message', {error: null, msg: foundMsg, pageType: 'Main', css: 'privateMessage/message.css', title: foundMsg.title + " - "  + config.title, isLogged: true,  user: req.user, pageNumb: req.params.id2, startPoint: startPoint, highestPageNumb: highestPageNumb, endPoint: endPoint, nextPage: (parseInt(req.params.id2) + 1)});
    } catch (e) {
        res.render('error', {error: 'The page number you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: true, user: req.user});
        return;
    }
});

module.exports = router;