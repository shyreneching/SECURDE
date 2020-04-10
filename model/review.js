const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var reviewSchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: "Book"
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    review_text: String
})

reviewSchema.statics.getReviewByID= async function(reviewID){
    return await this.findOne({
        _id: reviewID
    }); 
};

reviewSchema.statics.getReviewByAuthor = async function(authorID){
    return await this.find({
        author:{
            "$in": [authorID]
        }        
    });
};

reviewSchema.statics.getReviewByBook = async function(bookID){
    return await this.find({
        book:{
            "$in": [bookID]
        }        
    });
};

reviewSchema.statics.addReview = function(review, callback){
    review.save().then(callback);
};

reviewSchema.statics.getAllReview = async function(){
    return await this.find({});
}

reviewSchema.statics.delete = async function(reviewID){
    return await this.deleteOne({
        _id : reviewID
    });
}

reviewSchema.statics.updateBook = async function(reviewID, review_text){
    return await this.updateOne({
        _id: reviewID
    }, {
        review_text
    }, {
        new: true
    }); 
};

reviewSchema.methods.populate= async function(){
    return await reviewSchema.findOne({
        _id: this._id
    }).populate("user book");
};

var Review = mongoose.model("Review", reviewSchema)

module.exports = {
    Review
}