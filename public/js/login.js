$(document).ready(function () {
    $('.ui.form').form({
        fields: {
            username:{
                identifier: 'username',
                rules: [{
                type: 'empty',
                prompt: 'Please enter your username'
                    }
                    //checking for username here
                ]
            },
            password: {
                identifier: 'password',
                rules: [{
                        type: 'empty',
                        prompt: 'Please enter your password'
                    }
                    //checking for incorrect pw here
                ]
            }
        }
    });
});