const express = require("express");
const bodyparser = require("body-parser")
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcrypt');
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
    let syslog = new SystemLogs({
        action: "Entered Login Page",
        actor: req.session.username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)

    res.render("login.hbs")
})

router.post("/validLogin", async (req, res) => {
    var user = await User.getUserByUsername(req.body.username);
    console.log(user)
    if (user == undefined) {
        let syslog = new SystemLogs({
            action: "Invalid Credentials",
            actor: null,
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
        bcrypt.compare(req.body.password, user.password, async (err, same) => {
            if (same) {
                let syslog = new SystemLogs({
                    action: "Successfully Login",
                    actor: user.username,
                    ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        req.connection.socket.remoteAddress,
                    item: null,
                    datetime: moment().format('YYYY-MM-DD HH:mm')
                })
                SystemLogs.addLogs(syslog)
                req.session.username = user._id;
                res.cookie('userID', user._id, { 
                    maxAge: 1000*3600*24*365,
                    // sameSite: 'none',
                    // secure: true
                });
                res.redirect("/")
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
    }
    
})

router.get("/logout", async(req, res) => {
    req.session.username = null;
    req.session.id = null
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");

    let syslog = new SystemLogs({
        action: "Signed Out",
        actor: req.session.username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)

    res.redirect("/")
})

router.get("/signup", async(req, res) => {
    let syslog = new SystemLogs({
        action: "Entered Sign Up Page",
        actor: req.body.username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)

    res.render("signup.hbs")
})

router.post("/createaccount", async (req, res) => {
    let firstname = req.body.firstname
    let lastname = req.body.lastname
    let username = req.body.username
    let password = req.body.password
    let confirm_password = req.body.confirm_password
    let email = req.body.email
    let idNum = req.body.idnum
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
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, async function(err, hash) {
            user.password = hash
            user.salt = salt
            bcrypt.hash(security_answer, salt, async function(err, ans) {
                user.security_answer = ans
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
        })
    })
})

router.get("/forgot-password", async (req, res) => {
    let syslog = new SystemLogs({
        action: "Entered Forget Password",
        actor: null,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)
    res.render("forgot_password.hbs")
    // let template = fs.readFileSync('./views/forgot_password.html', 'utf-8');
    // res.send(template);
})

router.post("/forgot-password/2", urlencoder, async function (req, res) {
    var user = await User.getUserByEmail(req.body.email)
    let syslog = new SystemLogs({
        action: "Entered Email for Forget Password",
        actor: null,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)
    if (user == undefined) {
        let syslog = new SystemLogs({
            action: "Email Not Existing",
            actor: null,
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
        req.session.username = user._id;
        res.cookie('userID', user._id, { 
            maxAge: 1000*3600*24*365,
            // sameSite: 'none',
            // secure: true
        });
        res.render("forgot_password_page2.hbs")
    }
})

router.post("/forgot-password/3", urlencoder, async function (req, res) {
    var user = await User.getUserByID(req.session.username)
    let answer = req.body.security_answer
    let syslog = new SystemLogs({
        action: "Entered Security Answer for Forget Password",
        actor: null,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)

    if (user != undefined) {
        bcrypt.compare(answer, user.security_answer, async (err, same) => {
            if (same) {                
                req.session.username = user._id;
                res.cookie('userID', user._id, { 
                    maxAge: 1000*3600*24*365,
                    // sameSite: 'none',
                    // secure: true
                });
                res.render("forgot_password_page3.hbs")
            } 
        }, (error) => {
            let syslog = new SystemLogs({
                action: "Security Answer Not match",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: error,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/login");
        })
    }
    
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

router.post("/resetpassword", urlencoder, async function (req, res) {
    console.log("Enter Here")
    console.log(req.session.username)
    var user = await User.getUserByID(req.session.username)
    let password = req.body.new_password
    let confirm_password = req.body.confirm_new_password
    console.log(user)
    bcrypt.hash(req.body.new_password, user.salt, async function(err, hash) { 
        console.log(user.salt)
        console.log(hash)
        let changepw = await User.updateUserPassword(user._id, hash, function (userID, hash) {
            console.log(user._id)
            console.log(password)
            console.log(confirm_password)
            if (user && password == confirm_password) {
                let syslog = new SystemLogs({
                    action: "Successfully Reset Password",
                    actor: user.username,
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
                    action: "Failed to Reset Password",
                    actor: user.usernamell,
                    ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        req.connection.socket.remoteAddress,
                    item: null,
                    datetime: moment().format('YYYY-MM-DD HH:mm')
                })
                SystemLogs.addLogs(syslog)

                //res.send("Failed to Create Password");
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
                item: error,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        })
    })
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