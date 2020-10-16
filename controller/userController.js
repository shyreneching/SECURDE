const express = require("express");
const router = express.Router();
const moment = require('moment');
//const momentbusinesstime = require('moment-business-time');
const fs = require('fs');
const bcrypt = require('bcrypt');
const bodyparser = require("body-parser");
const urlencoder = bodyparser.urlencoded({
    extended: true
});

const { Author } = require("../model/author");
const { BorrowHistory } = require("../model/borrowHistory");
const { Book } = require("../model/book");
const { Review } = require("../model/review");
const { User } = require("../model/user");
const { SystemLogs } = require("../model/systemLogs");
const { BookInstance } = require("../model/bookInstance");

router.get("/", async (req, res) => {
        res.redirect("/");
})

router.post("/borrowBookInstance", urlencoder, async function (req, res) {
    let userID = req.session.username;
    let instanceID = req.body.instanceID;

    let instance = await BookInstance.getBookInstanceByID(instanceID)
    
    // deadline to return the books is 14 days after borrowing
    let date_available = moment().add(14, 'days');
    let actual_returned = '';
    let status = 'borrowed';

    let book = await Book.getBookByID(instance.book);
    let user = await User.getUserByID(userID);

    temp = await Author.getAuthorByID(book.author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < book.author.length; i++) {
        temp = await Author.getAuthorByID(book.author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }

    let username = user.username;
    let item = book.title + " By " + authorDisplay
    let action = 'Borrowed a book';    

    let borrowHistory = new BorrowHistory({
        bookID,
        userID,
        time_barrow: moment().format('YYYY-MM-DD HH:mm'),
        due_date: date_available,
        actual_returned,
        status
    });

    BorrowHistory.addBorrowHistory(borrowHistory, async function (borrowHistory) {
        if (borrowHistory) {
            let sysLogs = new SystemLogs({
                action,
                actor: username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        req.connection.socket.remoteAddress,
                item,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            });
            SystemLogs.addLogs(sysLogs);
        
            await BookInstance.updateInstance(instanceID, "Reserved", date_available)

            res.redirect("/book");
        } else {
            let syslog = new SystemLogs({
                action: "Failed to Borrow Book",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: item,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            console.log("Failed to Borrow Book")
            res.redirect("/error");
        }
    }, (error) => {
        let syslog = new SystemLogs({
            action: "Error",
            actor: null,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: error.message,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.redirect("/error");
    })
});

router.post("/addReview", urlencoder, async (req, res) => {
    let userID = req.session.username;
    let bookID = req.body.bookID;
    let review = req.body.review;
    
    let datetime = moment().format('YYYY-MM-DD HH:mm')

    let book = await Book.getBookByID(bookID);
    let user = await User.getUserByID(userID);

    temp = await Author.getAuthorByID(book.author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < book.author.length; i++) {
        temp = await Author.getAuthorByID(book.author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }

    let username = user.username;
    let item = book.title + " By " + authorDisplay
    let action = 'Added Review to a book';
    
    let newreview = new Review({
        bookID,
        userID,
        review,
        datetime
        
    });

    Review.addReview(newreview, async function (doc) {
        if (doc) {
            let sysLogs = new SystemLogs({
                action,
                actor: username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress || 
                            req.connection.socket.remoteAddress,
                item,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            });

            SystemLogs.addLogs(sysLogs);
    
            let reviews = book.reviews;
            reviews.push(doc._id);
            await Book.updateBookReview(bookID, reviews);

            res.redirect("/");
        } else {
            let syslog = new SystemLogs({
                action: "Failed to Add Review",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: item,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            console.log("Failed to Create Book")
            res.redirect("/error");
        }
    }, (error) => {
        let syslog = new SystemLogs({
            action: "Error",
            actor: null,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: error.message,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.redirect("/error");
    })
})


module.exports = router;