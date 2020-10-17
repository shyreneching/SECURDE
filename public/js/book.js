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

                // create sidebar and attach to menu open
                $('.ui.sidebar')
                    .sidebar('attach events', '.toc.item');

               
                // tab functionality
                $('.tabular.menu .item').tab();
                $('.tabular.menu .item').click(function () {
                    $('.tabular.menu .item').removeClass("active");
                    $('.tabular.menu .item').css({
                        color: "black"
                    });
                    $(this).addClass("active");
                    $(this).css({
                        color: "rgb(184, 164, 56)"
                    });
                    $(this).tab.context('.tabular.menu').siblings('.active').removeClass('active');
                    $('.tabular.menu .item').tab({
                        context: '.tabular.menu',
                        history: true,
                        historyType: 'state',
                        // base url for all other path changes
                        // path : '/my/base/url',
                    });
                });

                //Book status - changing font colour and showing/hiding Next Available Date div
                $(function(){
                    $("#table-bookinstances tr").each(function(){
                        var thisTr = this;
                        console.log($(this).find("#td-bookinstance_status").text())
                        if ($(this).find('#td-bookinstance_status').text()=='Reserved') {
                            // $(this).find('#priority').text('Low');
                            $(this).find("#td-bookinstance_status").removeClass("positive")
                            $(this).find("#td-bookinstance_status").addClass("negative")
                            $(this).find("#button-bookinstanceborrow").removeClass("blue")
                            $(this).find("#button-bookinstanceborrow").addClass("grey disabled")
                        }
                        else {
                            //Borrow Book show modal
                            //$('.borrow.button').on('click', function() {
                            $(this).find('#button-bookinstanceborrow').on('click', function() {
                                console.log(" $(this).data('id') " +  $(this).data('id'))
                                
                                id =  $(this).data('id')
                                
                                $('#modal-borrowbook').modal('setting', 'transition', 'vertical flip')
                                $('#modal-borrowbook').modal('show')
                                $('#button-borrowbook').attr("data-id",id)
                                $("#button-borrowbook").on("click", () =>{
                                    console.log(" $(this).data('id') " +  $(this).data('id'))
                                    id =  $(this).data('id')
                
                                    var url = "/user/borrowBookInstance";
                                    $.ajax({
                                        async : false,
                                        url : url,
                                        type : "POST",
                                        data : {
                                            data_id : id
                                        },
                                        success: function(data){
                                            var instance = data["message"]
                                            console.log("yehey")
                                            location.reload(true);
                                        }
                                    })
                                })
                            })
                        }
                    })        

                    // $( ".status-of-book" ).each(function() {
                    //     $('#td-bookinstance_status:contains(Reserved)').show(function(){
                    //         console.log($("#td-bookinstance_status").text())
                    //         $("#td-bookinstance_status").removeClass("positive")
                    //         $("#td-bookinstance_status").addClass("negative")
                    //         $("#button-bookinstanceborrow").removeClass("blue")
                    //         $("#button-bookinstanceborrow").addClass("grey disabled")
                    //     })
                    // });

                    // $('.status-of-book:contains(Available)').css({color: "rgb(154, 224, 153)"});
                    // $('.status-of-book:contains(Reserved)').css({color: "rgb(255, 122, 112)"});

                    // $('.status-of-book:contains(Reserved)').show(function(){
                    //     //$("#div-nextreservedate").show();
                    //     $(".status-of-book").removeClass("positive")
                    //     $(".status-of-book").addClass("negative")
                    //     $("#button-bookinstanceborrow").removeClass("blue")
                    //     $("#button-bookinstanceborrow").addClass("grey disabled")
                    // })
                    // $('#td-bookinstance_status:contains(Available)').show(function(){
                    //     $("#div-nextreservedate").hide();
                    // })
                });

                //Book Review Modal
                $('#button-review').on('click', function(){
                    $('#textarea-review').val('');
                    $('#modal-writebookreview').modal('setting', 'transition', 'fade up')
                    $('#modal-writebookreview').modal('show')
                });

                //table sorting functionality
                $('table').tablesort()

                //Book Instances datatable initialisation
                $('#table-bookinstances').DataTable({
                    "columnDefs": [
                        { "width": "40%", "targets": 0 },
                        { "width": "20%", "targets": 1 },
                        { "width": "25%", "targets": 2 },
                        { "width": "15%", "targets": 3 }
                    ],
                    "fixedColumns": true,
                })

                // //Borrow Book show modal
                // //$('.borrow.button').on('click', function() {
                // $('#button-bookinstanceborrow').on('click', function() {
                //     console.log(" $(this).data('id') " +  $(this).data('id'))
                //     console.log(" $(this).parent().data('id') " +  $(this).parent().data('id'))
                //     console.log(" $(this).parent().parent().data('id') " +  $(this).parent().parent().data('id'))
                //     id =  $(this).data('id')
                    
                //     $('#modal-borrowbook').modal('setting', 'transition', 'vertical flip')
                //     $('#modal-borrowbook').modal('show')
                //     $('#button-borrowbook').attr("data-id",id)
                //     $("#button-borrowbook").on("click", () =>{
                //         console.log(" $(this).data('id') " +  $(this).data('id'))
                //         console.log(" $(this).parent().data('id') " +  $(this).parent().data('id'))
                //         console.log(" $(this).parent().parent().data('id') " +  $(this).parent().parent().data('id'))
                //         id =  $(this).data('id')
    
                //         var url = "/user/borrowBookInstance";
                //         $.ajax({
                //             async : false,
                //             url : url,
                //             type : "POST",
                //             data : {
                //                 data_id : id
                //             },
                //             success: function(data){
                //                 var instance = data["message"]
                //                 console.log("yehey")
                                
                //                 $("#td-bookinstance_dateavailable").val("Reserved")
                //                 $("#button-bookinstanceborrow").removeClass("blue")
                //                 $("#button-bookinstanceborrow").addClass("grey disabled")
                //                 location.reload(true);
                //             }
                //         })
                //     })
                // })

                $("#button-confirmaddreview").on("click", () =>{
                    console.log("Submit!")
                    $("#form-writereview").submit()
                })

                $("#form-writereview").form({
                    fields: {
                        review_text : {
                            identifier: 'review_text',
                            rules: [
                                {
                                    type: 'empty',
                                    prompt: 'Please enter a book review'
                                }
                            ]
                        },
                    }
                })
            });