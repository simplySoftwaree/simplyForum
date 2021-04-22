const express        = require('express');
const User           = require('../../models/userSchema');
const checkField     = require('../controller/checkFields');
const bannedWords    = require('../controller/bannedWords');
const privateMessage = require('../../models/privateMessageSchema');
const config         = require('../../config');
const router         = express.Router();

router.get('/message/create/', async (req, res) =>{{
    //Check if user is logged in, if not redirect to login page
    if(!req.user){
        res.redirect('/login');
        return;
    };
    //Load thread creation page
    res.render('privateMessage/createMessage', {error: null, pageType: 'Main', css: 'privateMessage/messageCreate.css', title: 'Create Message - ' + config.title, isLogged: true, user: req.user});
}});

router.post('/message/create', async (req, res) => {
    //Check if user is logged in, if not redirect to login page
    if(!req.user){
        res.redirect('/login');
        return;
    };
    //Check if all fields are filled in, if not than show error
    let field      = [req.body.title, req.body.username, req.body.content];
    let isEmpty    = await checkField(field);
    if(isEmpty == true){
        res.render('privateMessage/createMessage', {error: "One or more fields are empty", pageType: 'Main', css: 'privateMessage/messageCreate.css', title: 'Create Message - ' + config.title, isLogged: true, user: req.user});
        return;
    };
    try {
        if(req.user.username == req.body.username){
            res.render('privateMessage/createMessage', {error: "You can't message yourself.", pageType: 'Main', css: 'privateMessage/messageCreate.css', title: 'Create Message - ' + config.title, isLogged: true, user: req.user});
            return;
        };
        let foundUser = await User.findOne({username: req.body.username});
        //Check if user is banned or muted, if they are then showcase error 
        if(req.user.ban || req.user.mute == true){
            res.render('privateMessage/createMessage', {error: "You are currently banned or muted", pageType: 'Main', css: 'privateMessage/messageCreate.css', title: 'Create Message - ' + config.title, isLogged: true, user: req.user});
            return;
        };
        if(req.user.confirm == false) {
            res.render('privateMessage/createMessage', {error: "You need to confirm your email to create a new message.", pageType: 'Main', css: 'privateMessage/messageCreate.css', title: 'Create Message - ' + config.title, isLogged: true, user: req.user});
            return;
        };
        //Check if title contains banned words
        let isBannedTitle = await bannedWords(req.body.title);
        if(isBannedTitle == true){
            res.render('privateMessage/createMessage', {error: "The title contains banned words.", pageType: 'Main', css: 'privateMessage/messageCreate.css', title: 'Create Message - ' + config.title, isLogged: true, user: req.user});
            return;
        };
        //Check if content contains banned words
        let isBannedCont = await bannedWords(req.body.content);
        if(isBannedCont == true){
            res.render('privateMessage/createMessage', {error: "The content contains banned words.", pageType: 'Main', css: 'privateMessage/messageCreate.css', title: 'Create Message - ' + config.title, isLogged: true, user: req.user});
            return;
        };
        let pm = {
            author:  {
                id: req.user._id,
                username: req.user.username
            },
            reciver: {
                id: foundUser.id,
                username: foundUser.username
            },
            title: req.body.title,
            content: req.body.content
        };
        let newMessage = await new privateMessage(pm);
        await newMessage.save();
        req.user.privateMsg.push(newMessage);
        req.user.save();
        foundUser.privateMsg.push(newMessage);
        foundUser.save();
        res.redirect('/message/' + newMessage.id + '/1');
    } catch (e) {
        res.render('privateMessage/createMessage', {error: `The user ${req.body.username}, doesn't exist`, pageType: 'Main', css: 'privateMessage/messageCreate.css', title: 'Create Message - ' + config.title, isLogged: true, user: req.user});
        return;
    }
});

router.post('/reply/:id', async (req, res) => {
    //Check if user is logged in, if not redirect to login page
    if(!req.user){
        res.redirect('/login');
        return;
    };
    try {
        let foundMsg = await privateMessage.findById(req.params.id);
        let foundUser;
        if(foundMsg.author.id == req.user.id){
            foundUser = await User.findById(foundMsg.reciver.id);
        }else{
            foundUser = await User.findById(foundMsg.reciver.id);
        }
        if(req.user.ban || req.user.mute == true){
            res.render('privateMessage/message', {error: 'You are currently banned or muted', msg: foundMsg, pageType: 'Main', css: 'privateMessage/message.css', title: foundMsg.title + " - "  + config.title, isLogged: true, user: req.user, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1});
            return;
        };
        let field      = [req.body.content];
        let isEmpty    = await checkField(field);
        if(isEmpty == true){
            res.render('privateMessage/message', {error: 'One or more fields are empty', msg: foundMsg, pageType: 'Main', css: 'privateMessage/message.css', title: foundMsg.title + " - "  + config.title, isLogged: true, user: req.user, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1});
            return;
        };
        let isBannedCont = await bannedWords(req.body.content);
        if(isBannedCont == true){
            res.render('privateMessage/message', {error: 'The content contains banned words.', msg: foundMsg, pageType: 'Main', css: 'privateMessage/message.css', title: foundMsg.title + " - "  + config.title, isLogged: true, user: req.user, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1});
            return;
        };
        let pageNumb = Math.ceil(foundMsg.privateMessageComment.length / 20);
        let commentID = Math.floor(Math.random() * (999999999999 - 100000000000 + 1) ) + 100000000000;
        let commentInfo = {
            author:  {
                id: req.user._id,
                username: req.user.username
            },
            content: req.body.content,
            privateMessage: req.params.id,
            id: commentID
        };
        foundMsg.privateMessageComment.push(commentInfo);
        foundMsg.save();
        req.user.privateMsg.pull(foundMsg.id);
        foundUser.privateMsg.pull(foundMsg.id);
        req.user.privateMsg.push(foundMsg.id);
        foundUser.privateMsg.push(foundMsg.id);
        req.user.save();
        foundUser.save();
        res.redirect('/message/' + foundMsg.id + '/' + pageNumb + '#' + commentID);
    } catch (e) {
        res.render('error', {error: 'The page number you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: true, user: req.user});
        return;
    }
});


module.exports = router;