const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var systemLogsSchema = new Schema({
    action: String,
    // username
    actor: String,
    // ip address
    ip_add: String,
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
    return await this.find({}).sort({'datetime': -1});
}

systemLogsSchema.statics.delete = async function(logID){
    return await this.deleteOne({
        _id : logID
    });
}

systemLogsSchema.statics.deleteSepcificAction = async function(action){
    return await this.deleteMany({
        action : action
    });
}

systemLogsSchema.statics.getInvalidLoginByIP = async function(IPAddress){
    return await this.find({
        ip_add : IPAddress,
        action: "Invalid Credentials"
    }).sort({'datetime': -1});
}

systemLogsSchema.statics.getValidLoginByIP = async function(IPAddress){
    return await this.find({
        ip_add : IPAddress,
        action: "Successfully Login"
    }).sort({'datetime': -1});
}

var SystemLogs = mongoose.model("SystemLogs", systemLogsSchema)

module.exports = {
    SystemLogs
}