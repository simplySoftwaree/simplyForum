const express       = require('express');
const parentNode    = require('../../models/parentNodeSchema');
const subNode       = require('../../models/subNodeSchema');
const thread        = require('../../models/threadSchema');
const checkField    = require('../controller/checkFields');
const bannedWords   = require('../controller/bannedWords');
const getEndPoint   = require('../controller/getEndPoint');
const getStartPoint = require('../controller/getStartPoint');
const config        = require('../../config');
const router        = express.Router();

router.get('/thread/create/:id', async (req, res) =>{{
    //Check if user is logged in, if not redirect to login page
    if(!req.user){
        res.redirect('/login');
        return;
    };
    try {
        //Find sub node
        let sNode = await subNode.findById(req.params.id);
        //Find parent node
        let pNode = await parentNode.findById(sNode.parentNode);
        //Load thread creation page
        res.render('threads/createThread', {error: null, pageType: 'Main', css: 'threads/threadCreate.css', title: 'Create Thread - ' + config.title, isLogged: true, user: req.user, subNode: sNode, pNode: pNode});
    } catch (e) {
        // if  sub node does not exist then showcase error 
        res.render('error', {error: 'The sub node node does not exist', pageType: 'Main', css: 'threads/threadCreate.css', title: 'Create Thread - ' + config.title, isLogged: true, user: req.user, subNode: req.params.id, pNode: null});
        return;
    };
}});

router.post('/thread/create/:id', async (req, res) =>{{
    //Check if user is logged in, if not redirect to login page
    if(!req.user){
        res.redirect('/login');
        return;
    };
    try {
        //Find sub node,
        let sNode = await subNode.findById(req.params.id);
        //Find parent node
        let pNode = await parentNode.findById(sNode.parentNode);
        //Check if user is banned or muted, if they are then showcase error 
        if(req.user.ban || req.user.mute == true){
            res.render('threads/createThread', {error: 'You are currently banned or muted', pageType: 'Main', css: 'threads/threadCreate.css', title: 'Create Thread - ' + config.title, isLogged: true, user: req.user, subNode: sNode, pNode: pNode});
            return;
        };
        if(req.user.confirm == false) {
            res.render('threads/createThread', {error: 'You need to confirm your email to create an account', pageType: 'Main', css: 'threads/threadCreate.css', title: 'Create Thread - ' + config.title, isLogged: true, user: req.user, subNode: sNode, pNode: pNode});
            return;
        };
        //Check if all fields are filled in, if not than show error
        let field      = [req.body.title, req.body.content];
        let isEmpty    = await checkField(field);
        if(isEmpty == true){
            res.render('threads/createThread', {error: 'One or more fields are empty.', pageType: 'Main', css: 'threads/threadCreate.css', title: 'Create Thread - ' + config.title, isLogged: true, user: req.user, subNode: sNode, pNode: pNode});
            return;
        };
        //Check if title contains banned words
        let isBannedTitle = await bannedWords(req.body.title);
        if(isBannedTitle == true){
            res.render('threads/createThread', {error: 'The title contains a banned word.', pageType: 'Main', css: 'threads/threadCreate.css', title: 'Create Thread - ' + config.title, isLogged: true, user: req.user, subNode: sNode, pNode: pNode});
            return;
        };
        //Check if content contains banned words
        let isBannedCont = await bannedWords(req.body.content);
        if(isBannedCont == true){
            res.render('threads/createThread', {error: 'The content contains a banned word.', pageType: 'Main', css: 'threads/threadCreate.css', title: 'Create Thread - ' + config.title, isLogged: true, user: req.user, subNode: sNode, pNode: pNode});
            return;
        };
        let threadInfo = {
            author:  {
                id: req.user._id,
                username: req.user.username
            },
            title: req.body.title,
            content: req.body.content,
            subNode: req.params.id,
        };
        //Create a thread
        let newThread = await new thread(threadInfo);
        //Than save that thread to the database
        newThread.watched.push(req.user.id);
        await newThread.save();
        //Add thread to user profile
        req.user.threads.push(newThread.id);
        //Add thread to watched threads inside user profile
        req.user.watchedThreads.push(newThread.id);
        //Save the profile to the database
        req.user.save();
        //Add thread to subnode
        sNode.threads.push(newThread.id);
        //Save that to the databse
        sNode.save();
        res.redirect('/thread/' + newThread.id + '/1');
    // if sub node does not exist then showcase error 
    } catch (e) {
        console.log(e);
        res.render('threads/createThread', {error: 'The sub node node does not exist', pageType: 'Main', css: 'threads/threadCreate.css', title: 'Create Thread - ' + config.title, isLogged: true, user: req.user, subNode: null, pNode: null});
        return;
    };
}});

router.get('/thread/:id/:id2', async (req, res) =>{{
    let isLogged = false;
    let user = null;
    //Check if user is logged in
    if(req.user){
        isLogged = true;
        user = req.user;
    };
    try {
        //Check if thread exist
        let foundThread = await thread.findById(req.params.id);
        //Find sub node
        let sNode = await subNode.findById(foundThread.subNode);
        //Find parent node
        let pNode = await parentNode.findById(sNode.parentNode);
        //This basically rounds the number to the next digit if it has a decimal place greater than zero
        let highestPageNumb = Math.ceil(foundThread.threadComments.length / 20);
        //If there are no comments set page number to 1
        if(highestPageNumb == 0){
            res.render('threads/thread', {error: null, thread: foundThread, pageType: 'Main', css: 'threads/thread.css', title: foundThread.title + " - "  + config.title, isLogged: isLogged, user: user, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1, parentNode: {title: pNode.title, id: pNode.id}, subNode: {title: sNode.title, id: sNode.id}});
            return;
        };
        //If page number is the search bar is larger than highestPageNumb, if it is than redirect to error page
        if(req.params.id2 > highestPageNumb){
            res.render('error', {error: 'The page number you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: isLogged, user: user});
            return;
        };
        let startPoint = await getStartPoint(parseInt(req.params.id2));
        let endPoint = await getEndPoint(foundThread.threadComments , parseInt(req.params.id2));
        //Showcase the thread page
        res.render('threads/thread', {error: null, thread: foundThread, pageType: 'Main', css: 'threads/thread.css', title: foundThread.title + " - "  + config.title, isLogged: isLogged, user: user, pageNumb: req.params.id2, highestPageNumb: highestPageNumb, startPoint: startPoint, endPoint: endPoint, nextPage: (parseInt(req.params.id2) + 1), parentNode: {title: pNode.title, id: pNode.id}, subNode: {title: sNode.title, id: sNode.id}});
    //If thread does not exist, show error page
    } catch (e) {
        res.render('error', {error: 'The thread you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: isLogged, user: user});
        return;
    }
}});

module.exports = router;