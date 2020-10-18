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
const { BookInstance } = require("../model/bookInstance");
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
    let isbn = req.body.book_isbn;
    let callNumber = req.body.book_callnumber;
    
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
        isbn: isbn,
        callNumber,
        date_added: moment().format('YYYY-MM-DD HH:mm')
    });

    Book.addBook(book, function (doc) {
        if (doc) {
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

            let instance = new BookInstance({
                book: doc._id,
                status: "Available"
            });
            BookInstance.addBookInstance(instance)

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

router.post("/deleteBook", urlencoder, async (req, res) => {
    let userID = req.session.username;
    let bookID = req.body.data_id;

    let book = await Book.getBookByID(bookID);
    let reviews = book.reviews;
    for (var l = 0; l < reviews.length; l++) {
        await Review.delete(reviews[l]);
    }

    let instance = await BookInstance.getInstancesOfBooks(bookID);
    for (var l = 0; l < instance.length; l++) {
        await BookInstance.deleteInstance(instance[l]);
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
    let action = 'Deleted a Book';

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

router.post("/editBook", urlencoder, async (req, res) => {
    let userID = req.session.username;
    let bookID = req.body.editbook_id;

    let book = await Book.getBookByID(bookID)
    let isbn = book.isbn
    
    let title = req.body.editbook_title;
    let authorlist = req.body.editbook_author.trim();
    let author = authorlist.split(',');
    let publisher = req.body.editbook_publisher;
    let year_of_publication = req.body.editbook_yearofpublication;
    // let isbn = req.body.edibook_isbn;
    let callNumber = req.body.editbook_callnumber;
    console.log(callNumber)
    
    //let reviews = req.body["reviews[]"];
    temp = await Author.getAuthorByID(author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < author.length; i++) {
        temp = await Author.getAuthorByID(author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }
    
    let user = await User.getUserByID(userID);
    let item = title + " by " + authorDisplay
    let action = 'Successfully Edited a Book';

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
    
    await SystemLogs.addLogs(sysLogs);

    let updateBook= new Book({
        title,
        author,
        publisher,
        year_of_publication,
        isbn,
        callNumber,
    });
    console.log(callNumber)

    let newBook = await Book.updateBook(bookID, updateBook);

    // res.json({message : "Success"});
    res.redirect("/")
})

router.post("/addBookInstance", urlencoder, async (req, res) => {
    let userID = req.session.username;
    let bookID = req.body.bookID;
    
    let book = await Book.getBookByID(bookID)

    temp = await Author.getAuthorByID(book.author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < book.author.length; i++) {
        temp = await Author.getAuthorByID(book.author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }
    
    let user = await User.getUserByID(userID);
    let item = book.title + " by " + authorDisplay
    let action = 'Successfully Added a Book Instance';
    
    let instance = new BookInstance({
        book: bookID,
        status: "Available"
    });

    BookInstance.addBookInstance(instance, function (doc) {
        if (doc) {
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

            res.redirect("/book?data_id=" + book._id);
        } else {
            let syslog = new SystemLogs({
                action: "Failed to Create Book Instance",
                actor: user.username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: item,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            console.log("Failed to Create Book Instance")
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
    let instanceID = req.body.data_id;

    let instance = await BookInstance.getBookInstanceByID(instanceID);
    let book = await Book.getBookByID(instance.book);


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

    await BookInstance.deleteInstance(instanceID);

    res.json({message : "Success"});
})


// router.post("/editBookInstance", urlencoder, async (req, res) => {
//     console.log("req.session.username " + req.session.username)
//     console.log("req.body.editbookinstance_id " + req.body.editbookinstance_id)
//     let userID = req.session.username;
//     let instanceID = req.body.editbookinstance_id;
//     let status = "Available";
//     if(req.body.status == "status_reserved"){
//         status = "Reserved"
//     } 
    
//     let date_available = moment(req.body.editbookinstance_dateavailable, 'MMMM DD, YYYY H:mm A').format('YYYY-MM-DD HH:mm')
 
//     let instance = await BookInstance.getBookInstanceByID(instanceID)
//     let book = await Book.getBookByID(instance.book);
//     let datetime = moment().format('YYYY-MM-DD HH:mm')
    
//     temp = await Author.getAuthorByID(book.author[0]);
//     let authorDisplay = temp.firstname + " " + temp.lastname
//     for (var i = 1; i < book.author.length; i++) {
//         temp = await Author.getAuthorByID(book.author[i]);
//         authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
//     }
    
//     let user = await User.getUserByID(userID);
//     let item = book.title + " by " + authorDisplay
//     let action = 'Successfully Edited a Book Instance';

//     if(instance.status == "Reserved" && status == "Available"){
//         let history =  await BorrowHistory.getUnreturnedBookHistory(instanceID)
//         let sysLogs = new SystemLogs({
//             action: "Returned a book for a user",
//             actor: user.username,
//             ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
//                     req.connection.remoteAddress || 
//                     req.socket.remoteAddress || 
//                     req.connection.socket.remoteAddress,
//             item,
//             datetime
//         });
//         SystemLogs.addLogs(sysLogs);

//         await BorrowHistory.updateTimeReturnedByID(history._id, moment().format('YYYY-MM-DD HH:mm'));
//     }

//     let sysLogs = new SystemLogs({
//         action,
//         actor: user.username,
//         ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
//                 req.connection.remoteAddress || 
//                 req.socket.remoteAddress || 
//                 req.connection.socket.remoteAddress,
//         item,
//         datetime
//     });
//     SystemLogs.addLogs(sysLogs);

//     let newInstance = await BookInstance.updateInstance(instanceID, status, date_available);

//     // res.json({message : "Success"});
//     res.redirect("/book?data_id=" + book._id)
// })

router.post("/editBookInstance", urlencoder, async (req, res) => {
    console.log("req.session.username " + req.session.username)
    console.log("req.body.user_borrower " + req.body.borrowing_user)
    let userID = req.session.username;
    let instanceID = req.body.editbookinstance_id;
    let borrowerID = req.body.borrowing_user;

    let status = req.body.status;
    console.log(status)

    if (status != null) {
        let userID = req.session.username;
        let instanceID = req.body.editbookinstance_id;
        
        let instance = await BookInstance.getBookInstanceByID(instanceID)
        let book = await Book.getBookByID(instance.book);
        let datetime = moment().format('YYYY-MM-DD HH:mm')
        
        temp = await Author.getAuthorByID(book.author[0]);
        let authorDisplay = temp.firstname + " " + temp.lastname
        for (var i = 1; i < book.author.length; i++) {
            temp = await Author.getAuthorByID(book.author[i]);
            authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
        }
        
        let user = await User.getUserByID(userID);
        let item = book.title + " by " + authorDisplay
        let action = 'Successfully Edited a Book Instance';

        let history =  await BorrowHistory.getUnreturnedBookHistory(instanceID)
        let sysLogs = new SystemLogs({
            action: "Returned a book for a user",
            actor: user.username,
            ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
            item,
        })

        SystemLogs.addLogs(sysLogs);

        await BorrowHistory.updateTimeReturnedByID(history._id, moment().format('YYYY-MM-DD HH:mm'));
        let date = null
        status = "Available"
        if (status == "status_reserved"){
            date = instance.date_available;
            status = "Reserved"
        }

        let newInstance = await BookInstance.updateInstance(instanceID, status, date);

        res.redirect("/book?data_id=" + book._id)
    } else {
        console.log("Reserving for someone")
        let instance = await BookInstance.getBookInstanceByID(instanceID)
        let book = await Book.getBookByID(instance.book);
        let datetime = moment().format('YYYY-MM-DD HH:mm')

        let date_available = moment().add(14, 'days').format('YYYY-MM-DD HH:mm')
        let actual_returned = '';
        let status = 'borrowed';
        
        temp = await Author.getAuthorByID(book.author[0]);
        let authorDisplay = temp.firstname + " " + temp.lastname
        for (var i = 1; i < book.author.length; i++) {
            temp = await Author.getAuthorByID(book.author[i]);
            authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
        }
        
        let user = await User.getUserByID(userID);
        let borrower = await User.getUserByID(borrowerID);
        let item = book.title + " by " + authorDisplay
        let action = 'Successfully borrowed book for ' + borrower.username;

        let borrowHistory = new BorrowHistory({
            book: instanceID,
            author: book.author,
            user: borrowerID,
            time_barrow: moment().format('YYYY-MM-DD HH:mm'),
            due_date: date_available,
            actual_returned,
            status
        });
        
        BorrowHistory.addBarrowHistory(borrowHistory, async function (borrowHistory) {
            if (borrowHistory) {
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
        // let sysLogs = new SystemLogs({
        //     action,
        //     actor: user.username,
        //     ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
        //             req.connection.remoteAddress || 
        //             req.socket.remoteAddress || 
        //             req.connection.socket.remoteAddress,
        //     item,
        //     datetime
        // });
        // SystemLogs.addLogs(sysLogs);

        // let newInstance = await BookInstance.updateInstance(instanceID, status, date_available);

        // res.redirect("/book?data_id=" + book._id)
    }
    
    
})

router.post("/changeDueDateInstance", urlencoder, async (req, res) => {
    console.log("req.session.username " + req.session.username)
    console.log("req.body.editbookinstance_id " + req.body.editbookinstance_id)
    let userID = req.session.username;
    let instanceID = req.body.editbookinstance_id;
    let status = "Available";
    if(req.body.status == "status_reserved"){
        status = "Reserved"
    } 
    
    let date_available = moment(req.body.editbookinstance_dateavailable, 'MMMM DD, YYYY H:mm A').format('YYYY-MM-DD HH:mm')
 
    let instance = await BookInstance.getBookInstanceByID(instanceID)
    let book = await Book.getBookByID(instance.book);
    let datetime = moment().format('YYYY-MM-DD HH:mm')
    
    temp = await Author.getAuthorByID(book.author[0]);
    let authorDisplay = temp.firstname + " " + temp.lastname
    for (var i = 1; i < book.author.length; i++) {
        temp = await Author.getAuthorByID(book.author[i]);
        authorDisplay = authorDisplay + ", " + temp.firstname + " " + temp.lastname
    }
    
    let user = await User.getUserByID(userID);
    let item = book.title + " by " + authorDisplay
    let action = 'Successfully Edited Due Date of Book Instance';

    let sysLogs = new SystemLogs({
        action,
        actor: user.username,
        ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress,
        item,
        datetime
    });
    SystemLogs.addLogs(sysLogs);

    let newInstance = await BookInstance.updateInstance(instanceID, "Reserved", date_available);

    res.redirect("/book?data_id=" + book._id)
})

router.post('/returnBook', function(req, res) {
    // console.log(req.body.data_id)
    Book.findOne({
        _id: req.body.data_id
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
        // var message;
        if(book) {
        //   console.log("HERE??")
            res.json({
                // title = book.title,
                // a
                message: book
            })
            // console.log(message)
        } else {
            let syslog = new SystemLogs({
                action: "Book Doesn't Exist",
                actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        }
        // res.json({message: message});
    });
});

router.post('/returnInstance', function(req, res) {
    // console.log(req.body.data_id)
    BookInstance.findOne({
        _id: req.body.data_id
    }, function(err, instance){
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
        // var message;
        if(instance) {
        //   console.log("HERE??")
            res.json({
                // title = book.title,
                // a
                message: instance
            })
            // console.log(message)
        } else {
            let syslog = new SystemLogs({
                action: "Book Doesn't Exist",
                actor: (req.session.username == null || User.getUserByID(req.session.username) == undefined) ? null : User.getUserByID(req.session.username).username,
                ip_add: (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress || 
                    req.connection.socket.remoteAddress,
                item: null,
                datetime: moment().format('YYYY-MM-DD HH:mm')
            })
            SystemLogs.addLogs(syslog)

            res.redirect("/error");
        }
        // res.json({message: message});
    });
});


module.exports = router;
