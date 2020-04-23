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
const { BorrowHistory } = require("../model/borrowHistory");
const { Book } = require("../model/book");
const { Review } = require("../model/review");
const { User } = require("../model/user");
const { SystemLogs } = require("../model/systemLogs");

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

router.post("/addUser", urlencoder, (req, res) => {

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let idNum = req.body.idNum;
    let security_question = req.body.security_question;
    let security_answer = req.body.security_answer;
    let accountType = req.body.accountType;
    
    let user= new User({
        firstname,
        lastname,
        username,
        password,
        email,
        idNum,
        security_question,
        security_answer,
        accountType
    });

    User.addUser(user, function (user) {
        if (user) {
            res.redirect("/***********SUCCES PAGE***************");
        } else {
            res.redirect("/*************ERROR IN CREATING USER PAGE************");
        }
    }, (error) => {
        res.send(error);
    })
})

router.post("/viewSystemLogs", urlencoder, async (req, res) => {
   
    let sysLogs = await SystemLogs.getAllLogs();

    res.send(sysLogs);
})




module.exports = router;