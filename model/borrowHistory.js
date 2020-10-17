const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var borrowHistorySchema = new Schema({
    // title: String,
    book: {
        type: Schema.Types.ObjectId,
        ref: "BookInstance"
    },
    author: [{
        type: Schema.Types.ObjectId,
        ref: "Author"
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    time_barrow: String,
    due_date: String,
    actual_returned: String,
    // returned || borrowed
    status: String
})

borrowHistorySchema.statics.getBorrowHistoryByID= async function(hisID){
    return await this.findOne({
        _id: hisID
    }); 
};

borrowHistorySchema.statics.addBarrowHistory = function(barrowHistory, callback){
    barrowHistory.save().then(callback);
};

borrowHistorySchema.statics.getAllHistory = async function(){
    return await this.find({}).sort({'time_barrow': 1});
}

borrowHistorySchema.statics.getUserHistory= async function(userID){
    return await this.find({
        'user': userID
    }); 
};

borrowHistorySchema.statics.getPreviousUserHistory= async function(userID){
    return await this.find({
        'user': userID,
        'status': "returned"
    }); 
};

borrowHistorySchema.statics.getCurrentUserHistory= async function(userID){
    return await this.find({
        'user': userID,
        'status': "borrowed"
    }); 
};

borrowHistorySchema.statics.delete = async function(hisID){
    return await this.deleteOne({
        _id : hisID
    });
}

borrowHistorySchema.statics.updateTimeReturnedByID = async function(hisID, actual_returned){
    return await this.updateOne({
        _id: hisID
    }, {
        actual_returned,
        status: 'returned'
    }, {
        new: true
    }); 
};

borrowHistorySchema.methods.populate= async function(){
    return await BorrowHistory.findOne({
        _id: this._id
    }).populate("user book author");
};

var BorrowHistory = mongoose.model("BorrowHistory", borrowHistorySchema)

module.exports = {
    BorrowHistory
}