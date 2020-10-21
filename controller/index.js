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
const { BookInstance } = require("../model/bookInstance");
const { Review } = require("../model/review");
const { User } = require("../model/user");
const { SystemLogs } = require("../model/systemLogs");

router.use("/user", require("./userController"));
router.use("/admin", require("./adminController"));
router.use("/manager", require("./managerController"));

router.get("/", async (req, res) => {
    //await SystemLogs.deleteSepcificAction("Entered Book Manager Page")
    let bookslist = await Book.getAllBook();
    let books = [];
    for (var l = 0; l < bookslist.length; l++) {
        let book = bookslist[l];
        //populate necessary info
        book = await book.populateAuthorandReviews();
        books.push(book);
    }

    if (req.session.username == null) {
        let syslog = new SystemLogs({
            action: "Entered Home Page",
            actor: null,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.render("books.hbs", {
            list : [{
                link: "/login",
                text: "Login",
            }],
            books: books
        })
    } else {
        var user = await User.getUserByID(req.session.username);
        if (user == undefined){
            req.session.username = null

            let syslog = new SystemLogs({
                action: "Entered Home Page",
                actor: null,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)
    
            res.render("books.hbs", {
                list : [{
                    link: "/login",
                    text: "Login",
                }],
                books: books
            })
        } else if (user.accountType == "user"){
            let syslog = new SystemLogs({
                action: "Entered Home Page",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)
    
            res.render("books.hbs", {
                list : [{
                    link: "/profile",
                    text: "Profile",
                }, {
                    link: "/logout",
                    text: "Logout",
                }],
                books: books,
                timeout: "/js/timeout.js"
            })
        } else if (user.accountType == "admin"){
            let syslog = new SystemLogs({
                action: "Entered Admin Page",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)
    
            let sysLogs = await SystemLogs.getAllLogs();
            let allUsers = await User.getAllUser();

            res.render("admin.hbs", {
                timeout: "/js/timeout.js",
                sysLogs: sysLogs,
                allUsers: allUsers
            })
        } else if (user.accountType == "book manager"){
            let syslog = new SystemLogs({
                action: "Entered Book Manager Page",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)
    
            let authors = await Author.getAllAuthor();
            let reviews = await Review.getAllReview()
            res.render("books_bm.hbs", {
                timeout: "/js/timeout.js",
                books: books,
                authors: authors,
                reviews: reviews
            })
        }
    }
})

router.get("/profile", async (req, res) => {
    let userID = req.session.username
    let user = await User.getUserByID(userID);

    if(req.session.username != null && user != undefined && user.accountType != "admin"){

        user.accountType = user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)

        let previousHistory = await BorrowHistory.getPreviousUserHistory(userID)
        let prevHistory = [];
        for (var l = 0; l < previousHistory.length; l++) {
            let temp = previousHistory[l];
            //populate necessary info
            if (temp.title == null  || temp.title == undefined || temp.title == ""){
                temp = await temp.populate();
                temp.book = await temp.book.populate()
                temp.title = temp.book.book.title
            } else {
                temp = await temp.populateUserandAuthor()
            }          
            prevHistory.push(temp);
        }

        let currentsHistory = await BorrowHistory.getCurrentUserHistory(userID)
        let currHistory = [];
        for (var l = 0; l < currentsHistory.length; l++) {
            let temp = currentsHistory[l];
            //populate necessary info
            if (temp.title == null || temp.title == undefined || temp.title == ""){
                temp = await temp.populate();
                temp.book = await temp.book.populate()
                temp.title = temp.book.book.title
            } else {
                temp = await temp.populateUserandAuthor()
            }            
            currHistory.push(temp);
        }

        let reviewlist = await Review.getReviewByUser(userID);
        let reviews = [];
        for (var l = 0; l < reviewlist.length; l++) {
            let temp = reviewlist[l];
            //populate necessary info
            temp = await temp.populate(); 
            //temp.book = await temp.book.populateAuthorandReviews();
            reviews.push(temp);
        }

        let syslog = new SystemLogs({
            action: "Entered Profile Page",
            actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        if(user.accountType == 'Book manager') {
            res.render("bm_profile.hbs", {
                user: user,
                timeout: '/js/timeout.js'
            })
        } else {
            res.render("student-teacher_profile.hbs", {
                user: user,
                prevHistory: prevHistory,
                currHistory: currHistory,
                reviews: reviews,
                timeout: '/js/timeout.js'
            })
        }

        
    } else {
        let syslog = new SystemLogs({
            action: "Unauthorized Access to Profile Page",
            actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.redirect("/")
    }
})

router.post("/changepassword", urlencoder, async function (req, res) {
    if(req.session.username == null){
        let syslog = new SystemLogs({
            action: "Session Timeout",
            actor: user.username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.redirect("/session-timeout")
    }

    var user = await User.getUserByID(req.session.username)
    let old_password = req.body.old_password
    let password = req.body.new_password
    let confirm_password = req.body.confirm_new_password

    bcrypt.compare(old_password, user.password, async (err, same) => {
        if (err){
            let syslog = new SystemLogs({
                action: "Error",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        } else if (same) {
            bcrypt.hash(req.body.new_password, user.salt, async function(err, hash) { 
                if (err){
                    let syslog = new SystemLogs({
                        action: "Error",
                        actor: user.username,
                        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress || 
                            req.connection.socket.remoteAddress,
                        item: err.message,
                        datetime: moment().format('YYYY-MM-DD HH:mm')
                    })
                    SystemLogs.addLogs(syslog)
        
                    res.redirect("/error");
                } else {
                    if(user && password == confirm_password){
                        let changepw = await User.updateUserPassword(user._id, hash)
                        // console.log(changepw)
                        let syslog = new SystemLogs({
                            action: "Successfully Changed Password",
                            actor: user.username,
                            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                                req.connection.remoteAddress || 
                                req.socket.remoteAddress || 
                                req.connection.socket.remoteAddress,
                            item: null,
                            datetime: moment().format('YYYY-MM-DD HH:mm')
                        })
                        SystemLogs.addLogs(syslog)
                        req.session.username = null;
                        res.redirect("/login");
                    } else {
                        let syslog = new SystemLogs({
                            action: "Failed to Change Password",
                            actor: user.usernamell,
                            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                                req.connection.remoteAddress || 
                                req.socket.remoteAddress || 
                                req.connection.socket.remoteAddress,
                            item: null,
                            datetime: moment().format('YYYY-MM-DD HH:mm')
                        })
                        SystemLogs.addLogs(syslog)
        
                        console.log("Failed to Reset Password")
                        res.redirect("/error");
                    }
                }
            }) 
        } else {
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
    
            res.redirect("/invalidlogin");
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


router.get("/login", async (req, res) => {
    let invalid = await SystemLogs.getInvalidLoginByIP((req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress);
    let valid = await SystemLogs.getValidLoginByIP((req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress);

    // res.send(invalid)

    if (req.session.username == null) {
        if(invalid.length >= 3 && moment(invalid[2].datetime, 'YYYY-MM-DD HH:mm').isAfter(moment().subtract(5, 'minutes')) && (valid.length == 0 || moment(valid[0].datetime, 'YYYY-MM-DD HH:mm').isBefore(moment(invalid[2].datetime, 'YYYY-MM-DD HH:mm')))) {
            let syslog = new SystemLogs({
                action: "Entered Login Page - Login Lockout",
                actor: (User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)
            
            res.render("login.hbs",{
                hidden: "",
                hidden2: "hidden",
                list:[],
                cancel:[{}]
            })
        } else {
            let syslog = new SystemLogs({
                action: "Entered Login Page - Normal",
                actor: (User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)
            
            res.render("login.hbs",{
                hidden: "hidden",
                hidden2: "hidden",
                list:[{}],
                cancel:[]
            })
        }
    } else {
        let syslog = new SystemLogs({
            action: "Unauthorized Access to Login Page",
            actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.redirect("/")
    }
})

router.get("/invalidlogin", async (req, res) => {
    let invalid = await SystemLogs.getInvalidLoginByIP((req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress);
    let valid = await SystemLogs.getValidLoginByIP((req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress);

    // res.send(invalid)

    if (req.session.username == null) {
        if(invalid.length >= 3 && moment(invalid[2].datetime, 'YYYY-MM-DD HH:mm').isAfter(moment().subtract(5, 'minutes')) && (valid.length == 0 || moment(valid[0].datetime, 'YYYY-MM-DD HH:mm').isBefore(moment(invalid[2].datetime, 'YYYY-MM-DD HH:mm')))) {
            let syslog = new SystemLogs({
                action: "Entered Login Page - Login Lockout",
                actor: (User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)
            
            res.render("login.hbs",{
                hidden: "",
                hidden2: "hidden",
                list:[],
                cancel:[{}]
            })
        } else {
            let syslog = new SystemLogs({
                action: "Entered Login Page - Invalid",
                actor: (User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)
            
            res.render("login.hbs",{
                hidden: "hidden",
                hidden2: "",
                list:[{}],
                cancel:[]
            })
        }
    } else {
        let syslog = new SystemLogs({
            action: "Unauthorized Access to Login Page",
            actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.redirect("/")
    }
})

router.post("/validLogin", async (req, res) => {
    var user = await User.getUserByUsername(req.body.username.trim());
    // console.log(user)
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

        res.redirect("/invalidlogin");
    } else {
        bcrypt.compare(req.body.password, user.password, async (err, same) => {
            if (err) {
                let syslog = new SystemLogs({
                    action: "Error",
                    actor: null,
                    ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        req.connection.socket.remoteAddress,
                    item: err.message,
                    datetime: moment().format('YYYY-MM-DD HH:mm')
                })
                SystemLogs.addLogs(syslog)

                res.redirect("/error");
            }
            else if (same) {
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
                // res.cookie('userID', user._id, { 
                //     maxAge: 1000*3600*24*365,
                //     // sameSite: 'none',
                //     // secure: true
                // });
                let updateLastlogin = await User.updateLogin(req.session.username, moment().format('YYYY-MM-DD HH:mm'))
                if(user.accountType == "admin"){
                    res.redirect("/admin")
                } else if(user.accountType == "book manager"){
                    res.redirect("/manager")
                }else {
                    res.redirect("/")
                }
                
            } else {
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
        
                res.redirect("/invalidlogin");
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
    }
    
})

router.get("/logout", async(req, res) => {
    let syslog = new SystemLogs({
        action: "Signed Out",
        actor: User.getUserByID(req.session.username).username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)

    req.session.username = null;
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");

    res.redirect("/")
})

router.get("/signup", async(req, res) => {
    if(req.session.username == null){
        let syslog = new SystemLogs({
            action: "Entered Sign Up Page",
            actor: null,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.render("signup.hbs")
    } else {
        let syslog = new SystemLogs({
            action: "Unauthorized Access to Sign Up Page",
            actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.redirect("/")
    }
})

router.post("/createaccount", async (req, res) => {
    let firstname = req.body.firstname.trim()
    let lastname = req.body.lastname.trim()
    let username = req.body.username.trim()
    let password = req.body.password
    let confirm_password = req.body.confirm_password
    let email = req.body.email.trim()
    let idNum = req.body.idnum.trim()
    let security_question = req.body.security_question.trim()
    let security_answer = req.body.security_answer.trim()

    username = username.toLowerCase().trim()
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

    let existun = await User.getUserByUsername(username);
    let existemail = await User.getUserByEmail(email);
    let existID = await User.getUserByIDNumber(idNum);
    bcrypt.genSalt(10, function(err, salt) {
        if (err){
            let syslog = new SystemLogs({
                action: "Error",
                actor: null,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        } else {
            bcrypt.hash(req.body.password, salt, async function(err, hash) {
                if (err){
                    let syslog = new SystemLogs({
                        action: "Error",
                        actor: null,
                        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress || 
                            req.connection.socket.remoteAddress,
                        item: err.message,
                        datetime: moment().format('YYYY-MM-DD HH:mm')
                    })
                    SystemLogs.addLogs(syslog)

                    res.redirect("/error");
                } else {
                    user.password = hash
                    user.salt = salt
                    bcrypt.hash(security_answer, salt, async function(err, ans) {
                        if (err){
                            let syslog = new SystemLogs({
                                action: "Error",
                                actor: null,
                                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                                    req.connection.remoteAddress || 
                                    req.socket.remoteAddress || 
                                    req.connection.socket.remoteAddress,
                                item: err.message,
                                datetime: moment().format('YYYY-MM-DD HH:mm')
                            })
                            SystemLogs.addLogs(syslog)
        
                            res.redirect("/error");
                        } else {
                            user.security_answer = ans
                            User.addUser(user, function (user) {
                                if (user && existun == null && existemail == null && existID == null && password == confirm_password) {
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

                                    //res.send("Username, Email, or ID Number already taken")
                                    console.log("Username, Email, or ID Number already taken")
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
                        }
                    })
                }
            })
        } 
    })
})

router.get("/forgot-password", async (req, res) => {
    if (req.session.username == null) {
        let syslog = new SystemLogs({
            action: "Entered Forget Password Page",
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
    } else {
        let syslog = new SystemLogs({
            action: "Unauthorized Access to Forget Password Page",
            actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        res.redirect("/")
    }
    // let template = fs.readFileSync('./views/forgot_password.html', 'utf-8');
    // res.send(template);
})

router.post("/forgot-password/2", urlencoder, async function (req, res) {
    var user = await User.getUserByEmail(req.body.email.trim())
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
        //res.send("Failed to Reset Password");
        console.log("Failed to Reset Password")
        res.redirect("/error");
    } else {
        req.session.temp = user._id;
        // res.cookie('userID', user._id, { 
        //     maxAge: 1000*3600*24*365,
        //     // sameSite: 'none',
        //     // secure: true
        // });
        res.render("forgot_password_page2.hbs", {
            question: user.security_question,
            email: user.email
        })
    }
})

router.post("/forgot-password/3", urlencoder, async function (req, res) {
    var user = await User.getUserByID(req.session.temp)
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
            if (err){
                let syslog = new SystemLogs({
                    action: "Error",
                    actor: null,
                    ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        req.connection.socket.remoteAddress,
                    item: err.message,
                    datetime: moment().format('YYYY-MM-DD HH:mm')
                })
                SystemLogs.addLogs(syslog)

                res.redirect("/error");
            } else if (same) {                
                req.session.temp = user._id;
                // res.cookie('userID', user._id, { 
                //     maxAge: 1000*3600*24*365,
                //     // sameSite: 'none',
                //     // secure: true
                // });
                res.render("forgot_password_page3.hbs")
            } else {
                let syslog = new SystemLogs({
                    action: "Security Answer Not match",
                    actor: user.username,
                    ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                        req.connection.remoteAddress || 
                        req.socket.remoteAddress || 
                        req.connection.socket.remoteAddress,
                    item: null,
                    datetime: moment().format('YYYY-MM-DD HH:mm')
                })
                SystemLogs.addLogs(syslog)
                //res.send("Failed to Reset Password");
                console.log("Failed to Reset Password")
                res.redirect("/error");
            }
        }, (error) => {
            let syslog = new SystemLogs({
                action: "Error",
                actor: user.username,
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
    // console.log("Enter Here")
    // console.log(req.session.temp)
    var user = await User.getUserByID(req.session.temp)
    let password = req.body.new_password
    let confirm_password = req.body.confirm_new_password
    // console.log(user)
    bcrypt.hash(req.body.new_password, user.salt, async function(err, hash) { 
        if (err){
            let syslog = new SystemLogs({
                action: "Error",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        } else {
            // console.log(user.salt)
            // console.log(hash)
            if(user && password == confirm_password){
                // console.log(user._id)
                // console.log(password)
                // console.log(confirm_password)
                let changepw = await User.updateUserPassword(user._id, hash)
                // console.log(changepw)
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
                req.session.temp = null;
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
                //res.send("Failed to Reset Password");
                console.log("Failed to Reset Password")
                res.redirect("/error");
            }
        }
    })
})

// router.post("/changePassword", urlencoder, async function (req, res) {
//     // console.log("Enter Here")
//     // console.log(req.session.temp)
//     var user = await User.getUserByID(req.session.username)
//     let password = req.body.new_password
//     let confirm_password = req.body.confirm_password
//     console.log(user)
//     bcrypt.hash(req.body.new_password, user.salt, async function(err, hash) { 
//         if (err){
//             let syslog = new SystemLogs({
//                 action: "Error",
//                 actor: user.username,
//                 ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
//                     req.connection.remoteAddress || 
//                     req.socket.remoteAddress || 
//                     req.connection.socket.remoteAddress,
//                 item: err.message,
//                 datetime: moment().format('YYYY-MM-DD HH:mm')
//             })
//             SystemLogs.addLogs(syslog)

//             res.redirect("/error");
//         } else {
//             console.log(user.salt)
//             console.log(hash)
//             if(user && password == confirm_password){
//                 console.log(user._id)
//                 console.log(password)
//                 console.log(confirm_password)
//                 let changepw = await User.updateUserPassword(user._id, hash)
//                 console.log(changepw)
//                 let syslog = new SystemLogs({
//                     action: "Successfully Changed Password",
//                     actor: user.username,
//                     ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
//                         req.connection.remoteAddress || 
//                         req.socket.remoteAddress || 
//                         req.connection.socket.remoteAddress,
//                     item: null,
//                     datetime: moment().format('YYYY-MM-DD HH:mm')
//                 })
//                 SystemLogs.addLogs(syslog)

//                 if(user.accountType == 'admin'){
//                     res.redirect("/");
//                 } else {
//                     res.redirect("/profile");
//                 }
//             } else {
//                 let syslog = new SystemLogs({
//                     action: "Failed to Change Password",
//                     actor: user.usernamell,
//                     ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
//                         req.connection.remoteAddress || 
//                         req.socket.remoteAddress || 
//                         req.connection.socket.remoteAddress,
//                     item: null,
//                     datetime: moment().format('YYYY-MM-DD HH:mm')
//                 })
//                 SystemLogs.addLogs(syslog)
//                 //res.send("Failed to Reset Password");
//                 console.log("Failed to Reset Password")
//                 res.redirect("/error");
//             }
//         }
//     })
// })

router.post('/usernamecheck', function(req, res) {
    User.findOne({username: req.body.username}, function(err, user){
        if(err) {
            let syslog = new SystemLogs({
                action: "Error",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        }
        var message;
        if(user) {
        //   console.log(user)
            message = "user exists";
            // console.log(message)
        } else {
            message= "user doesn't exist";
            // console.log(message)
        }
        res.json({message: message});
    });
});

router.post('/emailcheck', function(req, res) {
    User.findOne({email: req.body.email}, function(err, user){
        if(err) {
            let syslog = new SystemLogs({
                action: "Error",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        }
        var message;
        if(user) {
        //   console.log(user)
            message = "user exists";
            // console.log(message)
        } else {
            message= "user doesn't exist";
            // console.log(message)
        }
        res.json({message: message});
    });
});

router.post('/idcheck', function(req, res) {
    User.findOne({idNum: req.body.id}, function(err, user){
        if(err) {
            let syslog = new SystemLogs({
                action: "Error",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        }
        var message;
        if(user) {
        //   console.log(user)
            message = "user exists";
            // console.log(message)
        } else {
            message= "user doesn't exist";
            // console.log(message)
        }
        res.json({message: message});
    });
});

router.post('/authExists', function(req, res) {
    Author.findOne({
        firstname: req.body.firstname,
        lastname: req.body.lastname
    }, function(err, user){
        if(err) {
            let syslog = new SystemLogs({
                action: "Error",
                actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        }
        var message;
        if(user) {
        //   console.log(user)
            message = "author exists";
            // console.log(message)
        } else {
            message= "author doesn't exist";
            // console.log(message)
        }
        res.json({message: message});
    });
});

router.post('/ISBNExists', function(req, res) {
    Book.findOne({
        isbn: req.body.isbn
    }, function(err, book){
        if(err) {
            let syslog = new SystemLogs({
                action: "Error",
                actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        }
        var message;
        if(book) {
        //   console.log(user)
            message = "book exists";
            // console.log(message)
        } else {
            message= "book doesn't exist";
            // console.log(message)
        }
        res.json({message: message});
    });
});

var ansC
function changeAns(param){
    ansC = param
}

router.post('/isAnsCorrect', function(req, res) {
    User.findOne({email: req.body.email}, function(err, user){
        if(err) {
            let syslog = new SystemLogs({
                action: "Error",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        }
        var message;
        if (user != undefined) {
            bcrypt.compare(req.body.answer, user.security_answer, async (err, same) => {
                if (err){
                    let syslog = new SystemLogs({
                        action: "Error",
                        actor: null,
                        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress || 
                            req.connection.socket.remoteAddress,
                        item: err.message,
                        datetime: moment().format('YYYY-MM-DD HH:mm')
                    })
                    SystemLogs.addLogs(syslog)
    
                    res.redirect("/error");
                } else if (same) {                
                    changeAns("correct")
                } else {
                    changeAns("incorrect")
                }
            }, (error) => {
                let syslog = new SystemLogs({
                    action: "Error",
                    actor: user.username,
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
        }
        message = ansC
        res.json({message: message});
    });
});

router.post('/checkPassword', function(req, res) {
    User.findOne({_id: req.session.username}, function(err, user){
        if(err) {
            let syslog = new SystemLogs({
                action: "Error",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: err.message,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        }
        var message;
        if (user != undefined) {
            bcrypt.compare(req.body.password, user.password, async (err, same) => {
                if (err){
                    let syslog = new SystemLogs({
                        action: "Error",
                        actor: null,
                        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress || 
                            req.connection.socket.remoteAddress,
                        item: err.message,
                        datetime: moment().format('YYYY-MM-DD HH:mm')
                    })
                    SystemLogs.addLogs(syslog)
    
                    res.redirect("/error");
                } else if (same) {                
                    changeAns("correct")
                } else {
                    changeAns("incorrect")
                }
            }, (error) => {
                let syslog = new SystemLogs({
                    action: "Error",
                    actor: user.username,
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
        }
        message = ansC
        res.json({message: message});
    });
});

router.post('/isValidSession', function(req, res) {
    if(req.session.username == undefined || req.session.username == null){
        res.json({message: "no"});
    } else {
        res.json({message: "yes"});
    }
});

router.get("/session-timeout", async (req, res) => {
    let syslog = new SystemLogs({
        action: "Entered Session Timeout Page",
        actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)
    
    res.render('session_timeout.hbs')
    // let template = fs.readFileSync('./views/error_page.html', 'utf-8');
    // res.send(template);
})

router.get("/book", async (req, res) => {
    let bookID = req.query.data_id
    let userID = req.session.username

    let user = await User.getUserByID(userID)
    let book = await Book.getBookByID(bookID)
    if (book == undefined){
        let syslog = new SystemLogs({
            action: "Unauthorized Access to Book Page",
            actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)
        res.redirect("/error")
    } else {
        book = await book.populateAuthorandReviews();

        let reviewList = await Review.getReviewByBook(book._id)
        let rev = [];
        for (var l = 0; l < reviewList.length; l++) {
            let temp = reviewList[l];
            //populate necessary info
            temp = await temp.populate();
            temp.create_date = moment(temp.create_date).format('MMM DD, YYYY  HH:mm')
            rev.push(temp);
        }
        let instanceList = await BookInstance.getInstancesOfBooks(book._id)
        let instances = [{}];
        for (var l = 0; l < instanceList.length; l++) {
            let temp = instanceList[l];
            //populate necessary info
            temp = await temp.populate();
            if (temp.date_available != null && temp.date_available != ""){
                temp.date_available = moment(temp.date_available).format('MMM DD, YYYY  HH:mm')
            }
            instances.push(temp);
        }

        let syslog = new SystemLogs({
            action: "Entering Book Page - " + book._id,
            actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
            item: null,
            datetime: moment().format('YYYY-MM-DD HH:mm')
        })
        SystemLogs.addLogs(syslog)

        if(user == undefined){
            res.render("book.hbs", {
                list : [{
                    link: "/login",
                    text: "Login",
                }],
                hidden_borrow: "hidden",
                hidden_writereview: "hidden",
                user: user,
                book: book,
                instances: instances,
                rev:rev,
                temp: []
                // timeout: "/js/timeout.js"
            })
        } else if (user.accountType == "user"){
            res.render("book.hbs", {
                list : [{
                    link: "/profile",
                    text: "Profile",
                }, {
                    link: "/logout",
                    text: "Logout",
                }],
                user: user,
                book: book,
                instances: instances,
                rev: rev,
                temp: [{}],
                timeout: "/js/timeout.js"
            })
        } else {
            let users = await User.getAllUserUser();
            res.render("book_bm.hbs", {
                list : [{
                    link: "/profile",
                    text: "Profile",
                }, {
                    link: "/logout",
                    text: "Logout",
                }],
                users: users,
                user: user,
                book: book,
                instances: instances,
                rev: rev,
                temp: [{}],
                timeout: "/js/timeout.js"
            })
        }
    }
})

router.get("/error", async (req, res) => {
    let syslog = new SystemLogs({
        action: "Entered Error Page",
        actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)
    
    res.render('error_page.hbs')
    // let template = fs.readFileSync('./views/error_page.html', 'utf-8');
    // res.send(template);
})

router.get('*', (req, res) => {
    let syslog = new SystemLogs({
        action: "Page Not Found",
        actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress || 
            req.connection.socket.remoteAddress,
        item: null,
        datetime: moment().format('YYYY-MM-DD HH:mm')
    })
    SystemLogs.addLogs(syslog)

    res.redirect("/error")
})

module.exports = router;