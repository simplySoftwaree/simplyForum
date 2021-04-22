const express     = require('express');
const thread      = require('../../models/threadSchema');
const subNode     = require('../../models/subNodeSchema');
const parentNode  = require('../../models/parentNodeSchema');
const bannedWords = require('../controller/bannedWords');
const checkField  = require('../controller/checkFields');
const notify      = require('../controller/notifications')
const config      = require('../../config');
const router      = express.Router();

router.post('/comment/:id', async (req, res) => {
    //Check if user is logged in, if not redirect to login page
    if(!req.user){
        res.redirect('/login');
        return;
    };
    try {
        //Find the thread
        let foundThread = await thread.findById(req.params.id);
        //Find sub node
        let sNode = await subNode.findById(foundThread.subNode);
        //Find parent node
        let pNode = await parentNode.findById(sNode.parentNode);
        //Check if user is banned or muted, if they are then showcase error 
        if(req.user.ban || req.user.mute == true){
            res.render('threads/thread', {error: 'You are currently banned or muted', thread: foundThread, pageType: 'Main', css: 'threads/thread.css', title: foundThread.title  + config.title, isLogged: true, user: req.user, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1, parentNode: {title: pNode.title, id: pNode.id}, subNode: {title: sNode.title, id: sNode.id}});
            return;
        };
        //Check if all fields are filled in, if not than show error
        let field      = [req.body.content];
        let isEmpty    = await checkField(field);
        if(isEmpty == true){
            res.render('threads/thread', {error: 'You need to fill the comment section', thread: foundThread, pageType: 'Main', css: 'threads/thread.css', title: foundThread.title + " - "  + config.title, isLogged: true, user: req.user, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1, parentNode: {title: pNode.title, id: pNode.id}, subNode: {title: sNode.title, id: sNode.id}});
            return;
        };
        //Check if content contains banned words
        let isBannedCont = await bannedWords(req.body.content);
        if(isBannedCont == true){
            res.render('threads/thread', {error: 'This comment contains a banned words', thread: foundThread, pageType: 'Main', css: 'threads/thread.css', title: foundThread.title + " - "  + config.title, isLogged: true, user: req.user, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1, parentNode: {title: pNode.title, id: pNode.id}, subNode: {title: sNode.title, id: sNode.id}});
            return;
        };
        let commentID = Math.floor(Math.random() * (999999999999 - 100000000000 + 1) ) + 100000000000;
        let commentInfo = {
            author:  {
                id: req.user._id,
                username: req.user.username
            },
            content: req.body.content,
            thread: req.params.id,
            id: commentID
        };
        //Push comment to the thread comment list
        foundThread.threadComments.push(commentInfo);
        //Add user ti watched threads
        if(!foundThread.watched.includes(req.user.id)){
            foundThread.watched.push(req.user.id);
        };
        //Save the thread to the database
        await foundThread.save();
        //Get page number then redirect to that page
        let pageNumb = Math.ceil(foundThread.threadComments.length / 20);
        //Push comment to the user profile
        req.user.threadComments.push(commentInfo);
        //Check if user already has thread in watched thread, if not add it
        if(!req.user.watchedThreads.includes(foundThread.id)){
            req.user.watchedThreads.push(foundThread.id);
        };
        //Save user profile to the database
        req.user.save();
        notify({title: foundThread.title, id: foundThread.id, comment: commentID, pageNb: pageNumb}, {username: req.user.username, userId: req.user.id}, foundThread.watched);
        //Update the thread so it moves to top of the sub node
        await sNode.threads.pull(foundThread.id);
        await sNode.threads.push(foundThread.id);
        await sNode.save();
        res.redirect('/thread/' + foundThread.id + '/' + pageNumb + '#' + commentInfo.id);
    //If thread doesn't exist show error page
    } catch (e) {
        console.log(e);
        res.render('error', {error: 'The thread you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: true, user: req.user});
        return;
    }
});

module.exports = router;