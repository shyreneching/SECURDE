const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const urlencoder = bodyParser.urlencoded({
    extended: false
}) 

const session = require("express-session");
const path = require("path");
var app = new express();

mongoose.Promise = global.Promise
const MONGOLAB_URI = "mongodb+srv://securde_mp:databasepassword@onlinelibsys-srgiz.gcp.mongodb.net/test?retryWrites=true&w=majority" || "mongodb://localhost:27017/onlineLibsys"

mongoose.connect(MONGOLAB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch(err => console.log(err))

// app.use(urlencoder);
// app.use(session({
//     resave: false,
//     name: "appointment-system",
//     saveUninitialized: true, 
//     secret: "secretpass"
// }))
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(function(req, res, next) {
//     res.set("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
//     next();
// })

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(require("./controller"));

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running at port 3000...");
})