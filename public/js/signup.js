$(document)
    .ready(function () {
        var res = true

        function change(param){
            res = param
        }

        $.fn.form.settings.rules.alreadyExist = function(param) {
            var url = "/usercheck";
            console.log( $.ajax({
                async : false,
                url : url,
                type : "POST",
                data : {
                    username : param.toLowerCase()
                },
                dataType: "json",
                success: function(data){
                    if(data['message']==='user exists'){
                        change(false);
                    }else {
                        change(true);
                    }
                }
            }))
            return res
        }
        $('.ui.form')
            .form({
                fields: {
                    firstname: {
                        identifier: 'firstname',
                        rules: [
                            {
                                type: 'regExp',
                                value: /^[A-Za-z\s]+$/,
                                prompt: 'Please enter a valid first name'
                            }
                        ]
                    },
                    lastname: {
                        identifier: 'lastname',
                        rules: [
                            {
                                type: 'regExp',
                                value: /^[A-Za-z\s]+$/,
                                prompt: 'Please enter a valid last name'
                            }
                        ]
                    },
                    username:{
                        identifier: 'username',
                        rules: [{
                            type: 'empty',
                            prompt: 'Please enter your username'
                            }, {
                                type: 'alreadyExist',
                                prompt: 'This username is already registered, please choose another one.'
                            }
                            //checking for valid username here
                        ]
                    },
                    email: {
                        identifier: 'email',
                        rules: [
                            {
                                type: 'email',
                                prompt: 'Please enter a valid e-mail'
                            }
                        ]
                    },
                    idnum: {
                        identifier: 'idnum',
                        rules: [
                            {
                                type: 'regExp',
                                value: /^[0-9]{8}$/,
                                prompt: 'Please enter a valid ID number'
                            }
                        ]
                    },
                    password: {
                        identifier: 'password',
                        rules: [
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
                    confirm_password: {
                        identifier: 'confirm_password',
                        rules: [{
                                type: 'empty',
                                prompt: 'Please confirm your password'
                            },
                            {
                                type: 'match[password]',
                                prompt: 'Your password does not match'
                            }
                        ]
                    },
                    security_question: {
                        identifier: 'security_question',
                        rules: [{
                            type: 'empty',
                            prompt: 'Please select a security question.'
                            }
                        ]
                    },
                    security_answer: {
                        identifier: 'security_answer',
                        rules: [{
                            type: 'empty',
                            prompt: 'Please answer a security question'
                            }
                        ]
                    }
                }
            });

        $('.ui.dropdown').dropdown();
    });

    function check_existence(param) {
        var temp
        $.get('/usercheck?username='+param.toLowerCase(), function(response) {  
            $('#usernameResponseHidden').text(response.message)
            if ($('#usernameResponseHidden').html() === "user exists"){
                console.log("yes")
                temp = true
                // $('#usernameResponse').text('That username is taken. Please pick another')
            } else {
                console.log("no")
                temp = false
            }
        })
        console.log(temp)
        return temp
    }