$(document)
    .ready(function() {

    // fix menu when passed
    $('.masthead')
    .visibility({
    once: false,
    onBottomPassed: function() {
    $('.fixed.menu').transition('fade in');
    },
    onBottomPassedReverse: function() {
    $('.fixed.menu').transition('fade out');
    }
    })
    ;

    // create sidebar and attach to menu open
    $('.ui.sidebar')
        .sidebar('attach events', '.toc.item');
    
    // tab functionality
    $('.tabular.menu .item').tab();
    $('.tabular.menu .item').click(function(){
        $('.tabular.menu .item').removeClass("active");
        $('.tabular.menu .item'     ).css({color: "black"});
        $(this).addClass("active");
        $(this).css({color: "rgb(184, 164, 56)"});
        $(this).tab.context('.tabular.menu').siblings('.active').removeClass('active');
        $('.tabular.menu .item').tab({
        context : '.tabular.menu',
        history : true,
        historyType : 'state',
        // base url for all other path changes
        // path : '/my/base/url',
        });
    });

    //Change password show modal
    $('#change-password').on('click', function() { 
        // $('.field').removeClass('error')
        // $('#old-password').val('')
        // $('#new-password').val('')
        // $('#confirm-new-password').val('')

        //Resets form input fields from data values
        $('.ui.form').trigger("reset");
        //Resets form error messages and field styles
        $('.ui.form .field.error').removeClass( "error" );
        $('.ui.form.error').removeClass( "error" );
        $('#modal-changepassword').modal('setting', 'transition', 'vertical flip')
        $('#modal-changepassword').modal('show')
    });

    var res_pass

    function changePass(param){
        res_pass = param
    }

    $.fn.form.settings.rules.isPassCorrect = function(param) {
        var url = "/checkPassword";
        $.ajax({
            async : false,
            url : url,
            type : "POST",
            data : {
                password : param
            },
            dataType: "json",
            success: function(data){
                if(data['message']==='correct'){
                    changePass(true);
                }else {
                    changePass(false);
                }
            }
        })
        return res_pass
    }

    $('#form-changepassword')
            .form({
                fields: {
                    old_password: {
                        identifier: 'old_password',
                        rules: [
                            {
                                type: 'isPassCorrect',
                                prompt: 'Current password is incorrect'
                            }
                        ]
                    },
                    new_password: {
                    identifier: 'new_password',
                    rules: [{
                            type: 'empty',
                            prompt: 'Please enter your password'
                        },
                        {
                            type: 'length[6]',
                            prompt: 'Your password must be at least 6 characters'
                        },
                        {
                            type: 'regExp',
                            value: /.*[A-Z]/,
                            prompt: 'Your password must contain at least one uppercase letter [A-Z]'
                        },
                        {
                            type: 'regExp',
                            value: /.*[0-9]/,
                            prompt: 'Your password must contain at least one number [0-9]'
                        },
                        {
                            type: 'regExp',
                            value: /.*[!@#\$%\^<>\&*\)\(+=._-]/,
                            prompt: 'Your password must contain at least one special character [!@#$%^<>&*()+=._-]'
                        }
                    ]
                },
                confirm_new_password: {
                    identifier: 'confirm_new_password',
                    rules: [{
                            type: 'empty',
                            prompt: 'Please confirm your password'
                        },
                        {
                            type: 'match[new_password]',
                            prompt: 'Your password does not match'
                        }
                    ]
                },
                }
            });

            //Borrow Book show modal
            $('.borrowed_booktitle').on('click', function() {
            $('#modal-borrowedbook').modal('setting', 'transition', 'vertical flip')
            $('#modal-borrowedbook').modal('show')
            });
    
            //User Details show modal
            $('#user-name').on('click', function(){
                $('#modal-userdetails').modal('setting', 'transition', 'vertical flip')
                $('#modal-userdetails').modal('show')
            });

    });