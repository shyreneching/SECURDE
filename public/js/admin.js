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

        //system logs datatables initialisation and sorting
        $('#table-systemlogs').DataTable({
            "order": [[ 3, "desc" ]]
        })

        //users datatables initialisation and sorting
        $('#table-users').DataTable({
            "order": [[ 0, "asc" ]]
        })

        //Add manager account show modal
        $('#button-addmanager').on('click', function() {
            // $('.field').removeClass('error')
            // $('#old-password').val('')
            // $('#new-password').val('')
            // $('#confirm-new-password').val('')

            //Resets form input fields from data values
            $('.ui.form').trigger("reset");
            //Resets form error messages and field styles
            $('.ui.form .field.error').removeClass( "error" );
            $('.ui.form.error').removeClass( "error" );
            $('#modal-addmanager').modal('setting', 'closable', false, 'transition', 'vertical flip')
            $('#modal-addmanager').modal('show')
        });

        //Form error checking
        $('#form-addmanager')
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
                            }, 
                            // {
                            //     type: 'idAlreadyExist',
                            //     prompt: 'This ID number is already registered, please choose another one.'
                            // }
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