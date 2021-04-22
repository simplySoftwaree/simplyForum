const express    = require('express');
const parentNode = require('../../models/parentNodeSchema');
const checkField = require('../controller/checkFields');
const config     = require('../../config');
const router     = express.Router();

router.get('/parentnode/create', async (req, res) => {
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
    //Show parent node creation page
    res.render('threads/createParentNode', {error: null, pageType: 'Admin', css: 'threads/parentNodeCreate.css', title: 'Create Node - ' + config.title});
});

router.post('/parentnode/create', async (req, res) => {
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
    //Check if all fields are filled in, if not than show error
    let field      = [req.body.title];
    let isEmpty    = await checkField(field);
    if(isEmpty == true){
        res.render('threads/createParentNode', {error: 'The title field is empty', pageType: 'Admin', css: 'threads/parentNodeCreate.css', title: 'Create Node - ' + config.title});
        return;
    };
    //Create new parent node
    let newNode = await new parentNode({title: req.body.title});
    //Save parent node to the database
    await newNode.save();
    res.redirect('/parentnode/' + newNode.id);
});


router.get('/parentnode/:id', async (req, res) => {
    //Check if user is logged in
    let isLogged = false;
    let user = null;
    if(req.user){
        isLogged = true;
        user = req.user;
    };
    //Check if parent node exist, if not redirect to error page
    let foundNode = await parentNode.findById(req.params.id).populate("subNodes").exec();
    if(!foundNode){
        res.render('error', {error: 'The parent node you are looking for does not exist.', pageType: 'Main', css: 'error.css', title: 'Error - ' + config.title, isLogged: isLogged, user: user});
        return;
    };
    //Render parent node
    res.render('threads/parentNode', {node: foundNode, pageType: 'Main', css: 'threads/parentNode.css', title: foundNode.title  + config.title, isLogged: isLogged, user: user});
});

module.exports = router;