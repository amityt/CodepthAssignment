var mongoose = require("mongoose");
 
var postSchema = new mongoose.Schema({
    type:String,
    filtertype:String,
    name: String,
    image: String,
    description: String,
    date: String,
    author:
    {
        id:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"Users"
        },
        username:String
    }
});
 
module.exports = mongoose.model("Posts", postSchema);