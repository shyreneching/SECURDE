const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var bookSchema = new Schema({
    title: String,
    author: [{
        type: Schema.Types.ObjectId,
        ref: "Author"
    }],
    publisher: String,
    year_of_publication: String,
    isbn: String,
    callNumber: String,
    status: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
})

bookSchema.statics.getBookByID= async function(bookID){
    return await this.findOne({
        _id: bookID
    }); 
};

bookSchema.statics.getBooksByTitle= async function(title){
    return await this.find({
        'title': { $regex: ".*" + title + ".*"}
    }); 
};

bookSchema.statics.getBooksByAuthor = async function(authorID){
    return await this.find({
        author:{
            "$in": [authorID]
        }        
    });
};

bookSchema.statics.getBooksByPublisher = async function(publisher){
    return await this.find({
        'publisher': publisher        
    });
};

bookSchema.statics.addBook = function(book, callback){
    book.save().then(callback);
};

bookSchema.statics.getAllBook = async function(){
    return await this.find({}).sort({'title': 1});
}

bookSchema.statics.delete = async function(bookID){
    return await this.deleteOne({
        _id : bookID
    });
}

bookSchema.statics.updateBook = async function(bookID, book){
    return await this.updateOne({
        _id: bookID
    }, {
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        year_of_publication: book.year_of_publication,
        isbn: book.isbn,
        callNumber: callNumber,
        status: book.status,
        reviews: book.reviews
    }, {
        new: true
    }); 
};

bookSchema.statics.updateBookStatus = async function(bookID, status) {
    return await this.updateOne({
        _id: bookID
    }, {
        status
    });
}

bookSchema.methods.populateAuthor = async function(){
    return await Book.findOne({
        _id: this._id
    }).populate("author");
};

bookSchema.methods.populateReviews = async function(){
    return await Book.findOne({
        _id: this._id
    }).populate("reviews");
};

var Book = mongoose.model("Book", bookSchema)

module.exports = {
    Book
}