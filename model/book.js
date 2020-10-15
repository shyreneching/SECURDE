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
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    date_added: String
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

bookSchema.statics.getBookByISBN = async function(isbn){
    return await this.findOne({
        'isbn': isbn        
    });
};

bookSchema.statics.addBook = function(book, callback){
    book.save().then(doc => {
        callback (doc)
    });
};

bookSchema.statics.getAllBook = async function(){
    return await this.find({}).sort({'title': 1});
}

bookSchema.statics.getAllBookSortByDateAdded = async function(){
    return await this.find({}).sort({'date_added': 1});
}

bookSchema.statics.delete = async function(bookID){
    return await this.deleteOne({
        _id : bookID
    });
}

bookSchema.statics.updateBookReview = async function(bookID, reviews){
    return await this.updateOne({
        _id: bookID
    }, {
        reviews: book.reviews
    }, {
        new: true
    }); 
};

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

// bookSchema.statics.updateBookStatus = async function(bookID, status) {
//     return await this.updateOne({
//         _id: bookID
//     }, {
//         status
//     });
// }

bookSchema.methods.populateAuthorandReviews = async function(){
    return await Book.findOne({
        _id: this._id
    }).populate("author reviews");
};


var Book = mongoose.model("Book", bookSchema)

module.exports = {
    Book
}