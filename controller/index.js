const express = require("express");
const bodyparser = require("body-parser")
const router = express.Router();
const fs = require('fs');
const moment = require('moment');
const urlencoder = bodyparser.urlencoded({
    extended: false
})

const { Author } = require("../model/author");
const { BorrowHistory } = require("../model/borrowHistory");
const { Book } = require("../model/book");
const { Review } = require("../model/review");
const { User } = require("../model/user");
const { SystemLogs } = require("../model/systemLogs");

router.get("/", async (req, res) => {

    res.render("books.hbs")
    // let booklist = await Book.getAllBook();
    // let books = [];
    // for (var l = 0; l < booklist.length; l++) {
    //     let book = booklist[l];
    //     //populate necessary info
    //     book = await book.populateAuthorandReviews();
    //     books.push(book);
    // }
    // res.render('books.hbs', {
    //     books: books,
    // });

})

router.get("/login", async (req, res) => {
    res.render("login.hbs")
    // req.session.username = "admin";
    // if (req.session.username != null) {
    // if (req.session.username == "secretary") {
    //     res.redirect("/secretary");
    // } else if (req.session.username == "dentist") {
    //     res.redirect("/dentist");
    // } else if (req.session.username == "admin") {
    //     res.redirect("/admin");
    // }
    // } else {
    // let acc = await Account.getAllAccounts();
    // let template = fs.readFileSync('./views/login.html', 'utf-8');
    // res.send(template);
    // , {
    // account: JSON.stringify(acc)
    // })
    // }
})

router.get("/logout", async(req, res) => {
    req.session.username = null;
    req.session.id = null
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
    res.redirect("/")
})

router.get("/signup", async(req, res) => {
    res.render("signup.hbs")
    // let template = fs.readFileSync('./views/signup.html', 'utf-8');
    // res.send(template);
})

router.post("/createaccount", async (req, res) => {
    let firstname = req.body.firstname
    let lastname = req.body.lastname
    let username = req.body.username
    let password = req.body.password
    let confirm_password = req.body.confirm_password
    let email = req.body.email
    //let idNum = req.body.idNum
    let idNum = ''
    let security_question = req.body.security_question
    let security_answer = req.body.security_answer

    username = username.toLowerCase()
    let datetime = moment().format('YYYY-MM-DD HH:mm');

    let user = new User({
        firstname: firstname,
        lastname: lastname,
        username: username,
        password: password,
        email: email,
        idNum: idNum,
        security_question: security_question,
        security_answer: security_answer,
        accountType: 'user',
        lastLogin: datetime
    })

    let existing = await User.getUserByUsername(username);
    
    User.addUser(user, function (user) {
        if (user && existing == null && password == confirm_password) {
            let syslog = new SystemLogs({
                action: "Successfully Created Account",
                actor: username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/login");
        } else {
            let syslog = new SystemLogs({
                action: "Failed to Create Account",
                actor: null,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/signup");
        }
    }, (error) => {
        let syslog = new SystemLogs({
            action: "Error",
            actor: null,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: error,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.redirect("/error");
    })
    
})

router.get("/forgot-password", async (req, res) => {
    res.render("forgot_password.hbs")
    // let template = fs.readFileSync('./views/forgot_password.html', 'utf-8');
    // res.send(template);
})

router.post("/forgot-password/2", urlencoder, function (req, res) {
    res.render("forgot_password_page2.hbs")
    // let template = fs.readFileSync('./views/forgot_password_page2.html', 'utf-8');
    // res.send(template);

    // let username = req.body.user
    // let password = req.body.pww

    // Account.findOne({
    //     username,
    //     password
    // }, (err, doc)=>{
    //     if(err){
    //         res.send(err)
    //     }else if(doc){
    //         console.log(doc)
    //         req.session.username = doc.username
    //         res.redirect("/")
    //     }else{
    //         res.render("Login.hbs")
    //     }
    // })   
})

router.post("/forgot-password/3", urlencoder, function (req, res) {
    res.render("forgot_password_page3.hbs")
    // let template = fs.readFileSync('./views/forgot_password_page3.html', 'utf-8');
    // res.send(template);

    // let username = req.body.user
    // let password = req.body.pww

    // Account.findOne({
    //     username,
    //     password
    // }, (err, doc)=>{
    //     if(err){
    //         res.send(err)
    //     }else if(doc){
    //         console.log(doc)
    //         req.session.username = doc.username
    //         res.redirect("/")
    //     }else{
    //         res.render("Login.hbs")
    //     }
    // })   
})

router.get("/error", async (req, res) => {
    res.render('error_page.hbs')
    // let template = fs.readFileSync('./views/error_page.html', 'utf-8');
    // res.send(template);
})

router.get('*', (req, res) => {
    res.redirect("/error")
})


module.exports = router;