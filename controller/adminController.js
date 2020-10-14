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
    // console.log("This is session " + req.session.username)
    // var admin = await User.getUserByID(req.session.username)
    // if (admin != undefined && admin.accountType == "admin"){
    //     res.render("admin.hbs")
    // } else {
        res.redirect("/");
    // }
})

router.post("/get_all_users", urlencoder, async function (req, res) {

    let user = await User.getAllUser();
    res.send({
        user
    });
});

router.post("/search_user", urlencoder, async function (req, res) {
    let name = req.body.name;

    people = [];
    if (/\s/.test(name)) {
        nameArr = name.split(/(\s+)/);
        people.push(await User.getUserByName(nameArr[0], nameArr[1]));
    }
    else{
        people.push(await User.getUserByFirstName(name));
        people.push(await User.getUserByLastName(name));
    }   

    res.send({
        people
    });
});

router.post("/addUser", urlencoder, async (req, res) => {
    let temp = await User.getUserByUsername("admin")
    req.session.username = temp._id
    console.log(req.session.username)
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

    let user= new User({
        firstname: firstname,
        lastname: lastname,
        username: username,
        password: password,
        email: email,
        idNum: idNum,
        security_question: security_question,
        security_answer: security_answer,
        accountType: "book manager",
        lastLogin: datetime
    });

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
                            console.log("Before user is created " + req.session.username)
                            User.addUser(user, function (user) {
                                if (user && existun == null && existemail == null && existID == null && password == confirm_password) {
                                    let syslog = new SystemLogs({
                                        action: "Successfully Created Book Manager Account",
                                        actor: username,
                                        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                                            req.connection.remoteAddress || 
                                            req.socket.remoteAddress || 
                                            req.connection.socket.remoteAddress,
                                        item: null,
                                        datetime: moment().format('YYYY-MM-DD HH:mm')
                                    })
                                    SystemLogs.addLogs(syslog)
                                    console.log("After User is created " + req.session.username)
                                    res.redirect("/admin");
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
                                    res.redirect("/admin");
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

router.post("/viewSystemLogs", urlencoder, async (req, res) => {
   
    let sysLogs = await SystemLogs.getAllLogs();

    res.send(sysLogs);
})




module.exports = router;