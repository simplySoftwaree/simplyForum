const config = require('./config');

module.exports = async (textFile) =>{
    let isBanned = false;
    let lowercaseTextfile = textFile.toLowerCase();
    await config.bannedWords.forEach((i) => {
        if(lowercaseTextfile.includes(i.toLowerCase())){
            isBanned = true;
        }
    })
    return isBanned;
}