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
    // console.log(req.session.username)
    // console.log("instance id " + req.body.data_id)
    let userID = req.session.username;
    let instanceID = req.body.data_id;

    let instance = await BookInstance.getBookInstanceByID(instanceID)
    
    // deadline to return the books is 14 days after borrowing
    let date_available = moment().add(14, 'days').format('YYYY-MM-DD HH:mm')
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
        title: "",
        book: instanceID,
        author: book.author,
        user: userID,
        time_barrow: moment().format('YYYY-MM-DD HH:mm'),
        due_date: date_available,
        actual_returned,
        status
    });

    BorrowHistory.addBarrowHistory(borrowHistory, async function (borrowHistory) {
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

            res.redirect("/book?data_id=" + book._id)
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

router.post("/returnBook", urlencoder, async (req, res) => {
    //let bookID = req.body.bookID;
    let userID = req.session.username;
    let hisID = req.body._id;

    let history = await BorrowHistory.getBorrowHistoryByID(hisID)
    history = await history.populate()

    let datetime = moment().format('YYYY-MM-DD HH:mm')

    let instance = await BookInstance.getBookInstanceByID(history.book);
    instance = await instance.populate()
    let book = instance.book
    let user = await User.getUserByID(userID);

    temp = await Author.getAuthorByID(history.author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < history.author.length; i++) {
        temp = await Author.getAuthorByID(history.author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }

    let username = user.username;
    let item = book.title + " By " + authorDisplay
    let action = 'Returned a book';

    let sysLogs = new SystemLogs({
        action,
        actor: username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
        item,
        datetime
    });
    SystemLogs.addLogs(sysLogs);

    await BookInstance.updateInstance(instance._id, "Available", null)
    await BorrowHistory.updateTimeReturnedByID(hisID, datetime);

    res.redirect("/profile");
})

router.post("/addReview", urlencoder, async (req, res) => {
    // console.log("Entering addReview")
    // console.log("req.session.username " + req.session.username)
    // console.log("req.body.bookID " + req.body.bookID)
    // console.log("req.body.review_text"  +  req.body.review_text)
    let userID = req.session.username;
    let bookID = req.body.bookID;
    let review = req.body.review_text;
    
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
        book: bookID,
        user: userID,
        review_text: review,
        create_date: datetime
        
    });

    // console.log("newreview"  +  newreview)

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
            let update = await Book.updateBookReview(bookID, reviews);
            // console.log(update)
            res.redirect("/book?data_id=" + bookID);
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
        console.log("Error")
        res.redirect("/error");
    })
})

router.post("/editReview", urlencoder, async (req, res) => {
    let reviewID = req.body.reviewID;
    let userID = req.session.username;
    let new_review = req.body.review_text;
    
    let datetime = moment().format('YYYY-MM-DD HH:mm')

    let review = await Review.getReviewByID(reviewID)
    let book = await Book.getBookByID(review.book);
    let user = await User.getUserByID(userID);

    temp = await Author.getAuthorByID(book.author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < book.author.length; i++) {
        temp = await Author.getAuthorByID(book.author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }

    let username = user.username;
    let item = book.title + " By " + authorDisplay
    let action = 'Edited Review to a book';

    let sysLogs = new SystemLogs({
        action,
        actor: username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
        item,
        datetime
    });
    
    SystemLogs.addLogs(sysLogs);
    
    let newReview = await Review.updateReview(reviewID, new_review);
    res.redirect("/profile");
})

router.post("/deleteReview", urlencoder, async (req, res) => {
    // console.log("req.body.data_id " + req.body.data_id)

    let reviewID = req.body.data_id;
    let rev = await Review.getReviewByID(reviewID);

    let datetime = moment().format('YYYY-MM-DD HH:mm')
    let book = await Book.getBookByID(rev.book);
    let user = await User.getUserByID(rev.user);

    temp = await Author.getAuthorByID(book.author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < book.author.length; i++) {
        temp = await Author.getAuthorByID(book.author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }

    let username = user.username;
    let item = book.title + " By " + authorDisplay
    let action = 'Deleted Review to a book';

    let sysLogs = new SystemLogs({
        action,
        actor: username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
        item,
        item,
        datetime
    });
    
    SystemLogs.addLogs(sysLogs);

    var ary = book.reviews;
    ary.pull(reviewID);  
    book.review = ary
    await Book.updateBookReview(book.review)  
    await Review.delete(reviewID);

    res.json({message : "Success"});
})



module.exports = router;