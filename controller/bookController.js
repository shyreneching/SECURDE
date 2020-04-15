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

    let books = await Book.getAllBook();
    res.send({
        books
    });
});

router.post("/search_bookTitle", urlencoder, async function (request, result) {

    let title = req.body.title;
    let books = await Book.getBooksByTitle(title);
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

module.exports = router;