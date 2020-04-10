const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var authorSchema = new Schema({
    firstname: String,
    lastname: String,
    birthday: String,
    deathday: String
})

authorSchema.statics.getAuthorByID= async function(authorID){
    return await this.findOne({
        _id: authorID
    }); 
};

authorSchema.statics.getAuthorByName= async function(firstname, lastname){
    return await this.findOne({
        'firstname': firstname,
        'lastname': lastname
    }); 
};

authorSchema.statics.addAuthor = function(author, callback){
    author.save().then(callback);
};

authorSchema.statics.getAllAuthor = async function(){
    return await this.find({}).sort({'lastname': 1});
}

authorSchema.statics.delete = async function(authorID){
    return await this.deleteOne({
        _id : authorID
    });
}

var Author = mongoose.model("Author", authorSchema)

module.exports = {
    Author
}