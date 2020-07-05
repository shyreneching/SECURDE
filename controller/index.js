const express = require("express");
const router = express.Router();
const fs = require('fs');

router.get("/", async (req, res) => {
    // if (req.session.username == null) {
        res.redirect("/login");
    // } else {
        // let account = await Account.getAccountByUsername(req.session.username);
        // if (account.accountType == "secretary") {
        //     res.redirect("/secretary");
        // } else if (account.accountType == "admin") {
        //     res.redirect("/admin");
        // } else if (account.accountType == "dentist") {
        //     res.redirect("/dentist");
        // }
    // }
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


module.exports = router;