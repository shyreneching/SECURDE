const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    firstname: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
    idNum: String,
    security_question: String,
    security_answer: String,
    accountType: String,
    lastLogin: String
})

userSchema.statics.getUserByID = async function(userID){
    return await this.findOne({
        _id: userID
    }); 
};

userSchema.statics.getUserByName = async function(firstname, lastname){
    return await this.findOne({
        firstname,
        lastname
    }); 
};

userSchema.statics.getUserByFirstName = async function(firstname){
    return await this.findOne({
        firstname
    }); 
};

userSchema.statics.getUserByLastName = async function(lastname){
    return await this.findOne({
        lastname
    }); 
};

userSchema.statics.getUserByUsername = async function(username){
    return await this.findOne({
        username
    }); 
};

userSchema.statics.addUser = function(user, callback){
    user.save().then(callback);
};

userSchema.statics.getAllUser = async function(){
    return await this.find({}).sort({'lastname': 1});
}

userSchema.statics.delete = async function(userID){
    return await this.deleteOne({
        _id : userID
    });
}

userSchema.statics.updateUser = async function(userID, firstname, lastname){
    return await this.updateOne({
        _id: userID
    }, {
        firstname,
        lastname,
    }, {
        new: true
    }); 
};

userSchema.statics.updateUserPassword = async function(userID, password) {
    return await this.updateOne({
        _id: userID
    }, {
        password
    });
}

userSchema.statics.updateSecurityQuestion = async function(userID, sec_quest, sec_ans) {
    return await this.updateOne({
        _id: userID
    }, {
        security_question: sec_quest,
        security_answer: sec_ans,
    });
}


userSchema.statics.updateLogin = async function(userID, lastLogin) {
    return await this.updateOne({
        _id: userID
    }, { $set: {
        lastLogin
    }})
}

var User = mongoose.model("User", userSchema)

module.exports = {
    User
}