const config = require('./config');

module.exports = async (content) =>{
    let isBanned = false;
    let contenteLower = content.toLowerCase();
    await config.bannedWords.forEach((i) => {
        if(contenteLower.includes(i.toLowerCase())){
            isBanned = true;
        }
    })
    return isBanned;
}