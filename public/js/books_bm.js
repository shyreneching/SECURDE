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
            $('#modal-addbook').modal('setting', 'transition', 'vertical flip')
            $('#modal-addbook').modal('show')
        });

        //Edit Book show modal
        $('.edit.button').on('click', function() {
            //Resets form input fields from data values
            $('.ui.form').trigger("reset");
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

        //add book modal
        $('#button-add').on('click', function() {
            //Resets form input fields from data values
            $('.ui.form').trigger("reset");
            //Resets form error messages and field styles
            $('#modal-addbook').modal('setting', 'transition', 'vertical flip')
            $('#modal-addbook').modal('show')
        });

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
    });

