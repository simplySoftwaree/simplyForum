const config = require('../config');

module.exports = async (username) =>{
    let isBanned = false;
    let userNameLower = username.toLowerCase();
    await config.bannedWords.forEach((i) => {
        if(userNameLower.includes(i.toLowerCase())){
            isBanned = true;
        }
    })
    return isBanned;
}