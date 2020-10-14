$(document)
    .ready(function () {
        var res_email = true

        function changeEmail(param){
            res_email = param
        }

        $.fn.form.settings.rules.emailAlreadyExist = function(param) {
            var url = "/emailcheck";
            $.ajax({
                async : false,
                url : url,
                type : "POST",
                data : {
                    email : param.trim()
                },
                dataType: "json",
                success: function(data){
                    if(data['message']==='user exists'){
                        changeEmail(true);
                    }else {
                        changeEmail(false);
                    }
                }
            })
            return res_email
        }

        $('.ui.form')
            .form({
                fields: {
                    email: {
                        identifier: 'email',
                        rules: [{
                                type: 'empty',
                                prompt: 'Please enter your e-mail'
                            },
                            {
                                type: 'email',
                                prompt: 'Please enter a valid e-mail'
                            }, {
                                type: 'emailAlreadyExist',
                                prompt: 'Email does not exist'
                            }
                        ]
                    },
                    password: {
                        identifier: 'password',
                        rules: [{
                                type: 'empty',
                                prompt: 'Please enter your password'
                            },
                            {
                                type: 'length[6]',
                                prompt: 'Your password must be at least 6 characters'
                            }
                        ]
                    }
                }
            });
    });