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
const { BarrowHistory } = require("../model/barrowHistory");
const { Book } = require("../model/book");
const { Review } = require("../model/review");
const { User } = require("../model/user");

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

module.exports = router;