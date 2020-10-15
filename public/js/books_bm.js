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
        $('#data-table').DataTable();

        //Add Book show modal
        $('#button-add').on('click', function() {
            //Resets form input fields from data values
            $('.ui.form').trigger("reset");
            $('#dropdown-addbookauthors').dropdown('clear');
            $('#dropdown-addbookstatus').dropdown('clear');
            $('#modal-addbook').modal('setting', 'transition', 'vertical flip')
            $('#modal-addbook').modal('show')
        });

        //Edit Book show modal
        $('.edit.button').on('click', function() {
            //Resets form input fields from data values
            $('.ui.form').trigger("reset");
            $('#dropdown-editbookstatus').dropdown('clear');
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

        $('.modal').modal('setting', 'closable', false)

        $("#button-confirmaddbook").on("click", () =>{
            $("#form-addbook").submit()
        })

        var res_auth

        function changeAuth(param){
            res_auth = param
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
                        $("#button-canceladdauthor").click()
                    }
                })
            }
        })

        $("#button-canceladdauthor").on('click', () =>{
            $(".ui.form").trigger("reset")
            $('.ui.form .field.error').removeClass( "error" );
            $('.ui.form.error').removeClass( "error" );
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

