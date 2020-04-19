const express = require("express");
const router = express.Router();
const moment = require('moment');
const momentbusinesstime = require('moment-business-time');
const fs = require('fs');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended: true
});

const { Author } = require("../model/author");
const { BarrowHistory } = require("../model/borrowHistory");
const { Book } = require("../model/book");
const { Review } = require("../model/review");
const { User } = require("../model/user");

router.post("/get_all", urlencoder, async function (request, result) {

    let bookslist = await Book.getAllBook();
    let books = [];
    for (var l = 0; l < bookslist.length; l++) {
        let book = appointmentlist[l];
        //populate necessary info
        book = await book.populateAuthorandReviews();
        books.push(book);
    }

    res.send({
        books
    });
});

router.post("/search_bookTitle", urlencoder, async function (request, result) {

    let title = req.body.title;
    let bookslist = await Book.getBooksByTitle(title);

    let books = [];
    for (var l = 0; l < bookslist.length; l++) {
        let book = appointmentlist[l];
        //populate necessary info
        book = await book.populateAuthorandReviews();
        books.push(book);
    }

    res.send({
        books
    });
});

router.post("/addBook", urlencoder, (req, res) => {

    let title = req.body.title;
    let author = req.body["author[]"];
    let publisher = req.body.publisher;
    let year_of_publication = req.body.year_of_publication;
    let isbn = req.body.isbn;
    let callNumber = req.body.callNumber;
    let status = req.body.status;
    let reviews = req.body["reviews[]"];

    // let authorlist = [];
    // var arrayLength = author.length;
    // for (var i = 0; i < arrayLength; i++) {
    //     console.log(author[i]);
    //     //Do something
    //     let temp = Author.getAuthorByName(author[i].firstname, author[i].lastname);
    //     if(temp =  null){
    //         let firstname = author[i].firstname
    //         let lastname = author[i].lastname
    //         let newAuthor = new Author({
    //             firstname,
    //             lastname
    //         })
    //         Author.addAuthor(newAuthor);
    //     }
    //     temp = Author.getAuthorByName(author[i].firstname, author[i].lastname);
    //     authorlist.push(temp._id);

    // }
    
    let book= new Book({
        title,
        author,
        publisher,
        year_of_publication,
        isbn,
        callNumber,
        status,
        reviews
    });

    Book.addBook(book, function (book) {
        if (book) {
            res.redirect("/***********SUCCES PAGE***************");
        } else {
            res.redirect("/*************ERROR IN ADDING BOOK PAGE************");
        }
    }, (error) => {
        res.send(error);
    })
})

router.post("/editBook", urlencoder, async (req, res) => {
    let bookID = req.body.bookID;
    let title = req.body.title;
    let author = req.body["author[]"];
    let publisher = req.body.publisher;
    let year_of_publication = req.body.year_of_publication;
    let isbn = req.body.isbn;
    let callNumber = req.body.callNumber;
    let status = req.body.status;
    let reviews = req.body["reviews[]"];

    let book= new Book({
        title,
        author,
        publisher,
        year_of_publication,
        isbn,
        callNumber,
        status,
        reviews
    });

    let newBook = await Book.updateAppointment(bookID, updateBook);

    res.send("Success");
})

router.post("/deleteBook", urlencoder, async (req, res) => {
    let bookID = req.body.bookID;

    let book = await Book.getBookByID(bookID);
    let reviews = book.reviews;
    for (var l = 0; l < reviews.length; l++) {
        await Reiview.delete(reviews[l]);
    }

    let authors = book.reviews;
    for (var l = 0; l < authors.length; l++) {
        temp = await Book.getBooksByAuthor();
        if(temp.length == 1){
            await Author.delete(authors[l]);
        }
    }

    await Book.delete(bookID);

    res.send("Success");
})

router.post("/borrowBook", urlencoder, async (req, res) => {
    let bookID = req.body.bookID;
    let userID = req.body.userID;

    // let newTime = Date.parse(Date());
    // let formattedTime = moment(newTime).format("HH:mm");

    // let newDate = Date.parse(Date());
    // let formattedDate = moment(newDate).format("YYYY-MM-DD");

    let datetime = moment(Date(), 'YYYY-MM-DD HH:mm');

    // deadline to return the books is 14 days after borrowing
    let return_time = datetime.getDate() + 14;
    let actual_returned = '';
    let status = 'borrowed';

    let borrowHistory = new BarrowHistory({
        bookID,
        userID,
        datetime,
        return_time,
        actual_returned,
        status
    });

    BarrowHistory.addBarrowHistory(borrowHistory, function (borrowHistory) {
        if (borrowHistory) {
            res.redirect("/***********SUCCES PAGE***************");
        } else {
            res.redirect("/*************ERROR IN BARROWING BOOK PAGE************");
        }
    }, (error) => {
        res.send(error);
    })
})

router.post("/returnBook", urlencoder, async (req, res) => {
    // let bookID = req.body.bookID;
    // let userID = req.body.userID;

    let hisID = req.body.hisID;

    let datetime = moment(Date(), 'YYYY-MM-DD HH:mm');

    await BarrowHistory.updateTimeReturnedByID(hisID, datetime);

    res.send("Success");
})

router.post("/addReview", urlencoder, async (req, res) => {
    let bookID = req.body.bookID;
    let userID = req.body.userID;
    let review = req.body.review;
    
    let datetime = moment(Date(), 'YYYY-MM-DD HH:mm');

    // deadline to return the books is 14 days after borrowing
    let create_date = datetime.getDate() + 14;
    
    let review = new Review({
        bookID,
        userID,
        review,
        create_date
        
    });

    Review.addReview(review);
    let rev = await Review.getSpecificReview(bookID, userID, create_date);
    let temp = await Book.getBookByID(bookID);
    let reviews = temp.reviews;
    reviews.push(rev._id);
    await Book.$where.updateBookReview(bookID, reviews);
})

router.post("/editReview", urlencoder, async (req, res) => {
    let reviewID = req.body.reviewID;
    let review = req.body.review;
    
    let datetime = moment(Date(), 'YYYY-MM-DD HH:mm');

    // deadline to return the books is 14 days after borrowing
    let create_date = datetime.getDate() + 14;
    
    let review = new Review({
        bookID,
        userID,
        review,
        create_date  
    });

    let newReview = await Review.updateReview(reviewID, review);
    res.send("Success");
})

router.post("/deleteReview", urlencoder, async (req, res) => {
    let reviewID = req.body.reviewID;
    let rev = await Review.getReviewByID(reviewID);

    let Book = await Book.getBookByID(rev.bookID);
    var ary = Book.reviews;
    ary.pull(reviewID);    
    await Reiview.delete(reviewID);

    res.send("Success");
})

router.post("/addAuthor", urlencoder, (req, res) => {

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let birthday = req.body.birthday;
    let deathday = req.body.deathday;

    let newAuthor = new Author({
        firstname,
        lastname,
        birthday,
        deathday
    })
    
    Author.addAuthor(newAuthor, function (newAuthor) {
        if (newAuthor) {
            res.redirect("/***********SUCCES PAGE***************");
        } else {
            res.redirect("/*************ERROR IN ADDING BOOK PAGE************");
        }
    }, (error) => {
        res.send(error);
    })
})


module.exports = router;