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
    let author = req.body.author;
    let publisher = req.body.book_publisher;
    let year_of_publication = req.body.book_yearofpublication;
    let isbn = req.body.isbn;
    let callNumber = req.body.book_callnumber;
    let status = req.body.menu;
    //let reviews = req.body["reviews[]"];

    console.log(author)
    let datetime = moment(Date(), 'YYYY-MM-DD HH:mm');
    
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
    let user = await User.getUserByID(userID);
    let username = user.username;
    let item = title + " By " + author
    let action = 'Successfully Added a Book';

    let book= new Book({
        title,
        author,
        publisher,
        year_of_publication,
        //isbn,
        callNumber,
        status,
        //reviews,
        datetime
    });

    Book.addBook(book, function (book) {
        if (book) {
            let sysLogs = new SystemLogs({
                action,
                username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress || 
                            req.connection.socket.remoteAddress,
                item,
                datetime
            });
            
            SystemLogs.addLogs(sysLogs);

            res.redirect("/");
        } else {
            let syslog = new SystemLogs({
                action: "Failed to Create Book",
                actor: username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: item,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            //res.send("Username, Email, or ID Number already taken")
            console.log("Failed to Create Book")
            res.redirect("/");
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
            res.redirect("/");
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

            res.redirect("/");
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
