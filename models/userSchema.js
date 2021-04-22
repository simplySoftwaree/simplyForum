const mongoose               =  require("mongoose");
const passportLocalMongoose  =  require("passport-local-mongoose");

const UserSchema = new  mongoose.Schema({
    email:             String,
    username:          String,
    password:          String,
    avatarLink:        String,
    role:              String,
    confirm:           Boolean,
    confirmationCode:  Number,
    reset:             Boolean,
    avatar:            String,
    ban:               Boolean,
    banReason:         String,
    mute:              Boolean,
    muteReason:        String,
    muteExpire:        String,
    threads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread"
    }],
    watchedThreads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread"
    }],
    threadComments: [{
        content: String,
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users"
            },
            username: String,
        },
        thread: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread"
        },
        id: String,
        created: {
            type: Date,
            default: Date.now
        }
    }],
    notifications: [{
        title: {
            content: String,
            id: String,
            pageNb: String,
            comment: String
        },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users"
            },
            username: String,
        },
        created: {
            type: Date,
            default: Date.now
        }
    }],
    newNotifications: String,
    notificationEmail: Boolean,
    privateMsg: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Private_Message"
    }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);