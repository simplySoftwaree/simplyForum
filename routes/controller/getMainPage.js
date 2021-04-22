const User       = require('../../models/userSchema');
const parentNode = require('../../models/parentNodeSchema');
const config     = require('../../config');

module.exports = async (req, res) => {
    let isAdmin = await User.findOne({role: 'Admin'});
    if(!isAdmin){
        res.redirect('/admin/signup');
        return;
    };
    let isLogged = false;
    let user = null;
    if(req.user){
        isLogged = true;
        user = req.user;
    };
    let allNodes = await parentNode.find({}).populate("subNodes").exec();
    res.render('main', {error: null, pageType: 'Main', css: 'index.css', title: 'Main - ' + config.title, allNodes: allNodes, isLogged: isLogged, user: user});
};
