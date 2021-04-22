const mongoose =  require("mongoose");

const subNodeSchema = new mongoose.Schema({
    title: String,
    parentNode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parent Node"
    },
    threads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Threads"
    }]
});

module.exports = mongoose.model("Sub Node", subNodeSchema);
