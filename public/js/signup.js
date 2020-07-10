$(document)
    .ready(function () {
        $('.ui.form')
            .form({
                fields: {
                    firstname: {
                        identifier: 'firstname',
                        rules: [{
                                type: 'empty',
                                prompt: 'Please enter your first name'
                            },
                            {
                                type: 'regExp',
                                value: /^[A-Za-z\s]+$/,
                                prompt: 'Please enter a valid first name'
                            }
                        ]
                    },
                    lastname: {
                        identifier: 'lastname',
                        rules: [{
                                type: 'empty',
                                prompt: 'Please enter your last name'
                            },
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
                            }
                            //checking for valid username here
                        ]
                    },
                    email: {
                        identifier: 'email',
                        rules: [{
                                type: 'empty',
                                prompt: 'Please enter your e-mail'
                            },
                            {
                                type: 'email',
                                prompt: 'Please enter a valid e-mail'
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

        $('.ui.dropdown')
            .dropdown()
            ;
    });