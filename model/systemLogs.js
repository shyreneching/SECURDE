const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var systemLogsSchema = new Schema({
    action: String,
    // username
    actor: String,
    // book
    item: String,
    datetime: String
})

systemLogsSchema.statics.getLogsByID= async function(logID){
    return await this.findOne({
        _id: logID
    }); 
};

systemLogsSchema.statics.addLogs = function(log, callback){
    log.save().then(callback);
};

systemLogsSchema.statics.getAllLogs = async function(){
    return await this.find({}).sort({'date': 1});
}

systemLogsSchema.statics.delete = async function(logID){
    return await this.deleteOne({
        _id : logID
    });
}

var SystemLogs = mongoose.model("SystemLogs", systemLogsSchema)

module.exports = {
    SystemLogs
}