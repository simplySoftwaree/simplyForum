const mongoose =  require("mongoose");

const ThreadSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        },
        username: String,
    },
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
            id: String,
        },
        id: String,
        created: {
            type: Date,
            default: Date.now
        }
    }],
    subNode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sub Node"
    },
    watched: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],
    created:         {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Threads", ThreadSchema);