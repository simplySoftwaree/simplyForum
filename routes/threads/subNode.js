const express       = require('express');
const parentNode    = require('../../models/parentNodeSchema');
const subNode       = require('../../models/subNodeSchema');
const checkField    = require('../controller/checkFields');
const getEndPoint   = require('../controller/getEndPoint');
const getStartPoint = require('../controller/getStartPoint');
const config        = require('../../config');
const router        = express.Router();

router.get('/subnode/create/:id', async (req, res) => {
    //Check if user is logged in
    if(!req.user){
        res.redirect('/login');
        return;
    };
    //Check if user an Admin, if not redirect to an error page
    if(req.user.role !== 'Admin'){
        res.render('error', {error: 'Only admins are allowed to access this page.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: true, user: req.user});
        return;
    };
    try {
        let pNode = await parentNode.findById(req.params.id);
        //Show sub node creation page
        res.render('threads/createSubNode', {error: null, pageType: 'Admin', css: 'threads/subNodeCreate.css', title: 'Create Node - ' + config.title, isLogged: true, user: req.user, parentNode: pNode.id});
    } catch (e) {
        res.render('error', {error: 'The parent node does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: true, user: req.user});
        return;
    }
    //Check if parent node exist, if not than show error
});

router.post('/subnode/create/:id', async (req, res) => {
    //Check if user is logged in
    if(!req.user){
        res.redirect('/login');
        return;
    };
    //Check if user an Admin, if not redirect to an error page
    if(req.user.role !== 'Admin'){
        res.render('error', {error: 'Only admins are allowed to access this page.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: true, user: req.user});
        return;
    };
    //Check if parent node exist, if not than show error
    let pNode = await parentNode.findById(req.params.id);
    if(!pNode){
        res.render('threads/createSubNode', {error: 'The parent node does not exist', pageType: 'Admin', css: 'threads/subNodeCreate.css', title: 'Create Sub Node - ' + config.title});
        return;
    };
    //Check if all fields are filled in, if not than show error
    let field      = [req.body.title];
    let isEmpty    = await checkField(field);
    if(isEmpty == true){
        res.render('threads/createSubNode', {error: 'The title field is empty', pageType: 'Admin', css: 'threads/subNodeCreate.css', title: 'Create Sub Node - ' + config.title});
        return;
    };
    //Create a new sub node
    let newNode = await new subNode({title: req.body.title, parentNode: pNode.id});
    //Save the sub node to the database
    await newNode.save();
    //Push the sub node to parent node
    pNode.subNodes.push(newNode);
    //Save that to the database
    pNode.save();
    //Redirect to the subnode
    res.redirect('/subnode/' + newNode.id);
});

//If page number is not defined, than redirect to page 1
router.get('/subnode/:id', async (req, res) => {
    res.redirect('/subnode/' + req.params.id + '/1');
});


router.get('/subnode/:id/:id2', async (req, res) => {
    let isLogged = false;
    let user = null;
    //Check if user is logged in
    if(req.user){
        isLogged = true;
        user = req.user;
    };
    try {
        //If page number is 0, redirect to page 1
        if(req.params.id2 == 0){
            res.redirect('/subnode/' + req.params.id + '/1');
        }
        //Check if sub node exist
        let foundNode = await subNode.findById(req.params.id).populate("threads");
        //Find parent node
        let pNode = await parentNode.findById(foundNode.parentNode);
        //This basically rounds the number to the next digit if it has a decimal place greater than zero
        let highestPageNumb = Math.ceil(foundNode.threads.length / 20);
        //If there are no threads in the sub node, than set the pagenumb to 1
        if(highestPageNumb == 0){
            res.render('threads/subNode', {node: foundNode, pageType: 'Main', css: 'threads/subNode.css', title: foundNode.title + " - "  + config.title, isLogged: isLogged, user: user, pageNumb: 1, startPoint: 0, highestPageNumb: 1, endPoint: 0, nextPage: 1, parentNode: pNode.title});
            return;
        };
        //If page number is the search bar is larger than highestPageNumb, if it is than redirect to error page
        if(req.params.id2 > highestPageNumb){
            res.render('error', {error: 'The page number you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: isLogged, user: user});
            return;
        };
        let startPoint = await getStartPoint(parseInt(req.params.id2));
        let endPoint = await getEndPoint(foundNode.threads , parseInt(req.params.id2));
        //Next page 
        let nextPage = parseInt(req.params.id2)
        nextPage = nextPage + 1;
        //Showcase sub node
        res.render('threads/subNode', {node: foundNode, pageType: 'Main', css: 'threads/subNode.css', title: foundNode.title + " - "   + config.title, isLogged: isLogged, user: user, pageNumb: req.params.id2, highestPageNumb: highestPageNumb, startPoint: startPoint, endPoint: endPoint, nextPage: nextPage, parentNode: pNode.title});
    //If sub node doesn't exist show error page
    } catch (e) {
        res.render('error', {error: 'This sub node does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: isLogged, user: user});
        return;
    }
});

module.exports = router;