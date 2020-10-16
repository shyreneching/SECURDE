$(document)
    .ready(function () {

        // fix menu when passed
        $('.masthead')
            .visibility({
                once: false,
                onBottomPassed: function () {
                    $('.fixed.menu').transition('fade in');
                },
                onBottomPassedReverse: function () {
                    $('.fixed.menu').transition('fade out');
                }
            });

        //table sorting functionality
        $('table').tablesort()

        //datatable
        $('#data-table').DataTable({
            "columnDefs": [
                { "width": "30%", "targets": 0 },
                { "width": "28%", "targets": 1 },
                { "width": "15%", "targets": 2 },
                { "width": "5%", "targets": 3 },
                { "width": "22%", "targets": 4 },
            ],
            "fixedColumns": true,
        })

        //Add Book show modal
        $('#button-add').on('click', function() {
            //Resets form input fields from data values
            $('.ui.form').trigger("reset");
            $('#dropdown-addbookauthors').dropdown('clear');
            $('.ui.form .field.error').removeClass( "error" );
            $('.ui.form.error').removeClass( "error" );
            $('#modal-addbook').modal('setting', 'transition', 'vertical flip')
            $('#modal-addbook').modal('show')
        });

        //Edit Book show modal
        $('.edit.button').on('click', function() {
            //Resets form input fields from data values
            $('.ui.form').trigger("reset");
            $('#dropdown-editbookauthors').dropdown('clear');
            $('.ui.form .field.error').removeClass( "error" );
            $('.ui.form.error').removeClass( "error" );
            $('#modal-editbook').modal('setting', 'transition', 'vertical flip')
            $('#modal-editbook').modal('show')
        });

        //Delete Book show modal
        $('.delete.button').on('click', function() {
            $('#modal-deletebook').modal('setting', 'transition', 'vertical flip')
            $('#modal-deletebook').modal('show')
        });

        //calendar
        $('#editdate_picker').calendar();

        //dropdown initialisation
        $('.ui.dropdown').dropdown();

        //Book status - show/hide due date date picker
        $(function(){
            $("#field-duedate").hide();

            // $('#dropdown-id').dropdown('setting', 'onChange', function(){

            //     $('#dropdown-bookstatus:contains(Reserved)').toggle(function(){
            //     $("#field-duedate").show();
            //     })
            // });

            $('#dropdown-bookstatus:contains(Reserved)').show(function(){
                $("#field-duedate").show();
            })

            // $('#dropdown-bookstatus:equals(Available)').show(function(){
            //     $("#field-duedate").hide();
            // })
        });

        // $('#dropdown-id').dropdown('setting', 'onChange', function(){

        //     $('#dropdown-bookstatus:contains(Reserved)').show(function(){
        //     $("#field-duedate").show();
        //     })
            
        // });

        // $('#dropdown-bookstatus:contains(Reserved)').toggle(function(){
        // $("#field-duedate").show();
        // })

        // $('#dropdown-bookstatus:contains(Available)').show(function(){
        // $("#field-duedate").hide();
        // })
        
        $('.coupled.modal').modal({allowMultiple: true})
        
        $('#modal-addauthor').modal('attach events', '#button-addauthor')
        
        $('#modal-addauthor').modal('attach events', '#button-editaddauthor')

        $('.modal').modal('setting', 'closable', false)

        $("#button-confirmaddbook").on("click", () =>{
            $("#form-addbook").submit()
        })

        var res_auth
        var res_isbn

        function changeAuth(param){
            res_auth = param
        }

        function changeISBN(param){
            res_isbn = param
        }

        $.fn.form.settings.rules.isTaken = function(param) {
            var url = "/authExists";
            $.ajax({
                async : false,
                url : url,
                type : "POST",
                data : {
                    firstname : $("#auth_firstname").val().trim(),
                    lastname : param.trim()
                },
                dataType: "json",
                success: function(data){
                    if(data['message']==='author exists'){
                        changeAuth(false);
                    }else {
                        changeAuth(true);
                    }
                }
            })
            return res_auth
        }
        
        $.fn.form.settings.rules.isISBNTaken = function(param) {
            var url = "/ISBNExists";
            $.ajax({
                async : false,
                url : url,
                type : "POST",
                data : {
                    isbn : param.trim()
                },
                dataType: "json",
                success: function(data){
                    if(data['message']==='book exists'){
                        changeISBN(false);
                    }else {
                        changeISBN(true);
                    }
                }
            })
            return res_isbn
        }

        $('#form-addbook').form({
            fields : {
                book_title : {
                    identifier: 'book_title',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a book title'
                        }
                    ]
                },
                book_author : {
                    identifier: 'book_author',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please select a book author'
                        }
                    ]
                },
                book_publisher : {
                    identifier: 'book_publisher',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a book publisher'
                        }
                    ]
                },
                book_yearofpublication : {
                    identifier: 'book_yearofpublication',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a book year of publication'
                        },
                        {
                            type: 'regExp[/^(?:19|20)\\d{2}$/]',
                            prompt: 'Please enter a valid year of publication'
                        }
                    ]
                },
                book_isbn : {
                    identifier: 'book_isbn',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a book ISBN'
                        },
                        {
                            type: 'isISBNTaken',
                            prompt: 'This ISBN has already been registered with another book'
                        }
                    ]
                },
                book_callnumber : {
                    identifier: 'book_callnumber',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a call number'
                        },
                        {
                            type: 'regExp[/^\\d{3}$/]',
                            prompt: 'Please enter a valid call number'
                        }
                    ]
                }
            }
        })

        $("#form-addauthor").form({
            fields : {
                author_firstname : {
                    identifier: 'author_firstname',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a first name'
                        }
                    ]
                },
                author_lastname : {
                    identifier: 'author_lastname',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a last name'
                        } , {
                            type: 'isTaken',
                            prompt: 'Name already exists within the database'
                        }
                    ]
                }
            } , onSuccess:function(event){
                event.preventDefault();
                var url = "/manager/addAuthor";
                $.ajax({
                    async : false,
                    url : url,
                    type : "POST",
                    data : {
                        author_firstname :  $("#auth_firstname").val().trim(),
                        author_lastname :  $("#auth_lastname").val().trim(),
                    },
                    dataType: "json",
                    success: function(data){
                        var div = document.createElement("div")
                        $(div).attr("data-value", data['id'])
                        $(div).addClass("item")
                        $(div).text( data['firstname'] + ' ' + data['lastname'])
                        $("#auth-menu").append(div)
                        $("#auth-menu2").append($(div).clone())
                        $("#button-canceladdauthor").click()
                    }
                })
            }
        })

        $('#form-editbook').form({
            fields : {
                editbook_title : {
                    identifier: 'editbook_title',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a book title'
                        }
                    ]
                },
                editbook_author : {
                    identifier: 'editbook_author',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please select a book author'
                        }
                    ]
                },
                editbook_publisher : {
                    identifier: 'editbook_publisher',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a book publisher'
                        }
                    ]
                },
                editbook_yearofpublication : {
                    identifier: 'editbook_yearofpublication',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a book year of publication'
                        },
                        {
                            type: 'regExp[/^(?:19|20)\\d{2}$/]',
                            prompt: 'Please enter a valid year of publication'
                        }
                    ]
                },
                // editbook_isbn : {
                //     identifier: 'editbook_isbn',
                //     rules: [
                //         {
                //             type: 'empty',
                //             prompt: 'Please enter a book ISBN'
                //         }
                //     ]
                // },
                editbook_callnumber : {
                    identifier: 'editbook_callnumber',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a call number'
                        },
                        {
                            type: 'regExp[/^\\d{3}$/]',
                            prompt: 'Please enter a valid call number'
                        }
                    ]
                },
                // editbook_dateadded : {
                //     identifier: 'editbook_dateadded',
                //     rules: [
                //         {
                //             type: 'empty',
                //             prompt: 'Please choose a date'
                //         }
                //     ]
                // },
            }
        })

        $("#button-canceladdauthor").on('click', () =>{
            $("#form-addauthor").trigger("reset")
            $('#form-addauthor .field.error').removeClass( "error" );
            $('#form-addauthor.error').removeClass( "error" );
        })

        // $("#form-addauthor").on("submit", () => {
        //     var url = "/manager/addAuthor";
        //     $.ajax({
        //         async : false,
        //         url : url,
        //         type : "POST",
        //         data : {
        //             author_firstname :  $("#auth_firstname").val().trim(),
        //             author_lastname :  $("#auth_lastname").val().trim(),
        //         },
        //         dataType: "json",
        //         success: function(data){
        //             var div = document.createElement("div")
        //             $(div).attr("data-value", data['id'])
        //             $(div).addClass("item")
        //             $(div).text( data['firstname'] + ' ' + data['lastname'])
        //             $("#auth-menu").append(div)
        //             $("#button-canceladdauthor").click()
        //         }
        //     })
        //     return false
        // })

        $("#button-confirmaddauthor").on("click", () =>{
            $("#form-addauthor").submit()
        })

        var id

        $(".ui.tiny.labeled.icon.delete.button").on('click', function(){
            id = $(this).parent().parent().data('id')
        })

        $(".ui.tiny.yellow.labeled.icon.edit.button").on('click', function(){
            id = $(this).parent().parent().data('id')
            // console.log(id)

            var url = "/manager/returnBook";
            $.ajax({
                async : false,
                url : url,
                type : "POST",
                data : {
                    data_id : id
                },
                dataType: "json",
                success: function(data){
                    // console.log("hi")
                    var book = data["message"]
                    console.log(book)
                    $('input[name="editbook_title"]').val(book.title)
                    // var temp = []
                    // for(var i = 0; i < book.author.length; i++){
                        // temp.push(book.author[i]._id)
                        // $('#auth-menu2 div[data-value"'+book.author[i]+'"]').addClass("active filtered")
                    // }
                    $('#dropdown-editbookauthors').dropdown('set selected', book.author)
                    $('input[name="editbook_publisher"]').val(book.publisher)
                    $('input[name="editbook_yearofpublication"]').val(book.year_of_publication)
                    $('input[name="editbook_callnumber"]').val(book.callNumber)
                    $('input[name="editbook_id"]').val(book._id)
                }
            })
        })

        $("#button-deletebook").on('click', () => {
            var url = "/manager/deleteBook";
            $.ajax({
                async : false,
                url : url,
                type : "POST",
                data : {
                    data_id : id
                },
                dataType: "json",
                success: function(data){
                    $('.book-row[data-id="'+id+'"]').remove()
                }
            })
        })
    });

