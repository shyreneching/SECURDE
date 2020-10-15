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

router.get("/", async (req, res) => {
    // var manager = await User.getUserByID(req.session.username)
    // if (manager != null && manager.accountType == "book manager"){
    //     res.render("books_bm.hbs")
    // } else {
        res.redirect("/");
    // }
})

router.post("/addBook", urlencoder, async (req, res) => {
    console.log(req.session.username)
    let userID = req.session.username;
    let title = req.body.book_title;
    //let author = req.body["author[]"];
    let authorlist = req.body.book_author.trim();
    let author = authorlist.split(',');
    let publisher = req.body.book_publisher;
    let year_of_publication = req.body.book_yearofpublication;
    let isbn = req.body.isbn;
    let callNumber = req.body.book_callnumber;
    let status = null
    if (req.body.status == "status_available"){
        status = "Available"
    } else {
        status = "Reserved"
    }
    
    //let reviews = req.body["reviews[]"];
    temp = await Author.getAuthorByID(author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < author.length; i++) {
        temp = await Author.getAuthorByID(author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }
    
    let user = await User.getUserByID(userID);
    let item = title + " by " + authorDisplay
    let action = 'Successfully Added a Book';
    
    let book= new Book({
        title,
        author,
        publisher,
        year_of_publication,
        isbn,
        callNumber,
        status,
        //reviews,
        date_added: moment().format('YYYY-MM-DD HH:mm')
    });

    Book.addBook(book, function (book) {
        if (book) {
            let sysLogs = new SystemLogs({
                action,
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress || 
                            req.connection.socket.remoteAddress,
                item,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            });
            
            SystemLogs.addLogs(sysLogs);

            res.redirect("/");
        } else {
            let syslog = new SystemLogs({
                action: "Failed to Create Book",
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

router.post("/addAuthor", urlencoder, async (req, res) => {

    let firstname = req.body.author_firstname;
    let lastname = req.body.author_lastname;
    let userID = req.session.username;

    let user = await User.getUserByID(userID);

    let newAuthor = new Author({
        firstname,
        lastname,
    })
    
    Author.addAuthor(newAuthor, function (newAuthor) {
        if (newAuthor) {
            let syslog = new SystemLogs({
                action: "Added Author",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)
            res.json({
                id: newAuthor._id,
                firstname: newAuthor.firstname,
                lastname: newAuthor.lastname
            });
        } else {
            let syslog = new SystemLogs({
                action: "Failed to Add Author",
                actor: username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: item,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

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

router.post("/deleteBookInstance", urlencoder, async (req, res) => {
    let userID = req.session.username;
    let bookID = req.body.data_id;

    let book = await Book.getBookByID(bookID);
    let reviews = book.reviews;
    for (var l = 0; l < reviews.length; l++) {
        await Review.delete(reviews[l]);
    }

    temp = await Author.getAuthorByID(book.author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < book.author.length; i++) {
        temp = await Author.getAuthorByID(book.author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }

    let user = await User.getUserByID(userID);
    let username = user.username;
    let item = book.title + " By " + authorDisplay
    let action = 'Deleted a Book Instance';

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

    await Book.delete(bookID);

    res.json({message : "Success"});
})

module.exports = router;
