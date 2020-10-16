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

        var id
        $("#data-table").on('click', 'tbody > tr', function(){
            console.log("Clicking here")
            console.log(" $(this).data('id') " +  $(this).data('id'))

            id = $(this).data('id')

            window.location.href = "/book?data_id=" + id;
            // $.ajax({
            //     async : false,
            //     url : url,
            //     type : "POST",
            //     data : {
            //         data_id : id
            //     },
            //     success: function(){
            //         console.log("yehey")
            //     }
            // })
        })
    });