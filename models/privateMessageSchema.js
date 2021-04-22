const mongoose =  require("mongoose");

const privateMessageSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        username: String,
    },
    reciver: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        username: String,
    },
    privateMessageComment: [{
        content: String,
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users"
            },
            username: String,
        },
        privateMessage: {
            id: String,
        },
        id: String,
        created: {
            type: Date,
            default: Date.now
        }
    }],
    created:         {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Private_Message", privateMessageSchema);