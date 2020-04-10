const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    firstname: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
    idNum: String,
    accountType: String,
    //lastLogin: String
})

userSchema.statics.getUserByID = async function(userID){
    return await this.findOne({
        _id: userID
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


// userSchema.statics.updateLogin = async function(doctorID, lastLogin) {
//     return await this.updateOne({
//         _id: doctorID
//     }, { $set: {
//         lastLogin
//     }})
// }

var User = mongoose.model("User", userSchema)

module.exports = {
    User
}