const express     = require('express');
const getMainPage = require('./controller/getMainPage');
const router      = express.Router();

router.get('/', async (req, res) =>{
    getMainPage(req, res);
});


module.exports = router;