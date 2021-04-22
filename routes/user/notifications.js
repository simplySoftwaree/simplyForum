const express       = require('express');
const getStartPoint = require('../controller/getStartPoint');
const getEndPoint   = require('../controller/getEndPoint');
const config        = require('../../config');
const router        = express.Router();

router.get('/notifications', async (req, res) => {
    res.redirect('/notifications/1');
});

router.get('/notifications/:id', async (req, res) => {
    if(!req.user){
        res.redirect('/login');
    };
    req.user.newNotifications = 0;
    req.user.save();
    let highestPageNumb = Math.ceil(req.user.notifications.length / 20);
    //If there are no comments set page number to 1
    if(highestPageNumb == 0){
        res.render('users/notifications', {pageType: 'Main', css: 'users/notifications.css', title: 'Notifications - ' + config.title, isLogged: true, user: req.user, pageNumb: req.params.id, highestPageNumb: 0, startPoint: 0, endPoint: 0, nextPage: 1});
        return;
    };
    //If page number is the search bar is larger than highestPageNumb, if it is than redirect to error page
    if(req.params.id > highestPageNumb){
        res.render('error', {error: 'The page number you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: isLogged, user: user});
        return;
    };
    let startPoint = await getStartPoint(parseInt(req.params.id));
    let endPoint = await getEndPoint(req.user.notifications , parseInt(req.params.id));
    res.render('users/notifications', {pageType: 'Main', css: 'users/notifications.css', title: 'Notifications - ' + config.title, notifications: req.user.notifications,  isLogged: true, user: req.user, pageNumb: req.params.id, highestPageNumb: highestPageNumb, startPoint: startPoint, endPoint: endPoint, nextPage: (parseInt(req.params.id) + 1)});
});

module.exports = router;