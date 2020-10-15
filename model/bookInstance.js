const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var bookInstanceSchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: "Book"
    },
    // Available, Reserved
    status: String,
})

bookInstanceSchema.statics.getBookInstanceByID= async function(bookID){
    return await this.findOne({
        _id: bookID
    }); 
};

bookInstanceSchema.statics.getBooksByTitle= async function(title){
    return await this.find({
        'title': { $regex: ".*" + title + ".*"}
    }); 
};

// bookInstanceSchema.statics.getBooksByAuthor = async function(authorID){
//     return await this.find({
//         author:{
//             "$in": [authorID]
//         }        
//     });
// };

// bookInstanceSchema.statics.getBooksByPublisher = async function(publisher){
//     return await this.find({
//         'publisher': publisher        
//     });
// };

bookInstanceSchema.statics.addBookInstance = function(book, callback){
    book.save().then(callback);
};

bookInstanceSchema.statics.getAllBookInstance = async function(){
    return await this.find({}).sort({'title': 1});
}

bookInstanceSchema.statics.getInstancesOfBooks = async function(bookID){
    return await this.find({
        book:{
            "$in": [bookID]
        }        
    });
};

bookInstanceSchema.statics.deleteInstance = async function(bookID){
    return await this.deleteOne({
        _id : bookID
    });
}

bookInstanceSchema.statics.updateBookStatus = async function(bookID, status) {
    return await this.updateOne({
        _id: bookID
    }, {
        status
    });
}

bookInstanceSchema.methods.populateAuthorandReviews = async function(){
    return await Book.findOne({
        _id: this._id
    }).populate("author reviews");
};


var BookInstance = mongoose.model("BookInstance", bookInstanceSchema)

module.exports = {
    BookInstance
}