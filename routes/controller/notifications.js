const User = require('../../models/userSchema');

module.exports = async (title, author, users) => {
    users.forEach(async (i) => {
        if(i != author.userId){
            let foundUser = await User.findById(i);
            if(foundUser.notificationEmail == true){
                //sendEmail
            }
            let notify = {
                title:{
                    content: title.title,
                    id: title.id,
                    pageNb: title.pageNb,
                    comment: title.comment
                },
                author:{
                    id: author.userId,
                    username: author.username
                }
            }
            foundUser.notifications.push(notify);
            foundUser.newNotifications = parseInt(foundUser.newNotifications) + 1;
            foundUser.save();
        };
    });
};
