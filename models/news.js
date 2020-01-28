var mongoose =require("mongoose");

var newsSchema = new mongoose.Schema({

    india: [
        {
            name: String,
            image: String,
            description: String
        }
    ],

    technology: [
        {
            name: String,
            image: String,
            description: String 
        }
    ],

    international: [
        {
            name: String,
            image: String,
            description: String 
        }
    ],

    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

module.exports = mongoose.model("News",newsSchema)