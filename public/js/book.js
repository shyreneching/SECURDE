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

                //Borrow Book show modal
                $('#button-borrow').on('click', function() {
                $('#modal-borrowbook').modal('setting', 'transition', 'vertical flip')
                $('#modal-borrowbook').modal('show')
                });
                
            });