const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var borrowHistorySchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: "Book"
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    time_barrow: String,
    time_returned: String
})

borrowHistorySchema.statics.getBorrowHistoryByID= async function(hisID){
    return await this.findOne({
        _id: hisID
    }); 
};

borrowHistorySchema.statics.addBook = function(barrowHistory, callback){
    barrowHistory.save().then(callback);
};

borrowHistorySchema.statics.getAllHistory = async function(){
    return await this.find({});
}

borrowHistorySchema.statics.delete = async function(hisID){
    return await this.deleteOne({
        _id : hisID
    });
}

borrowHistorySchema.statics.updateTimeReturnedByID = async function(hisID, time_returned){
    return await this.updateOne({
        _id: hisID
    }, {
        time_returned
    }, {
        new: true
    }); 
};

borrowHistorySchema.methods.populate= async function(){
    return await borrowHistorySchema.findOne({
        _id: this._id
    }).populate("user book");
};

var BorrowHistory = mongoose.model("BorrowHistory", borrowHistorySchema)

module.exports = {
    BorrowHistory
}