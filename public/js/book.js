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
                    $('#book-status:contains(Available)').css({color: "rgb(154, 224, 153)"});
                    $('#book-status:contains(Reserved)').css({color: "rgb(255, 122, 112)"});

                    $('#book-status:contains(Reserved)').show(function(){
                        $("#div-nextreservedate").show();
                    })
                    $('#book-status:contains(Available)').show(function(){
                        $("#div-nextreservedate").hide();
                    })
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

                //Borrow Book show modal
<<<<<<< HEAD
                $('#button-borrow').on('click', function() {
                $('#modal-borrowbook').modal('setting', 'transition', 'vertical flip')
                $('#modal-borrowbook').modal('show')
                });

                $("#button-confirmaddreview").on("click", () =>{
                    console.log("Submit!")
                    $("#form-writereview").submit()
=======
                $('.borrow.button').on('click', function() {
                    $('#modal-borrowbook').modal('setting', 'transition', 'vertical flip')
                    $('#modal-borrowbook').modal('show')
>>>>>>> 785ac7fcb27c26071751d06517a4df024e54fbf2
                })
                
            });