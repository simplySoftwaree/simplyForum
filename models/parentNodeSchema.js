const mongoose =  require("mongoose");

const ParentNodeSchema = new mongoose.Schema({
    title: String,
    subNodes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sub Node"
    }]
});

module.exports = mongoose.model("Parent Node", ParentNodeSchema);
