$(document)
    .ready(function () {
        $('.ui.form')
            .form({
                fields: {
                    security_answer: {
                        identifier: 'security_answer',
                        rules: [{
                                type: 'empty',
                                prompt: 'Please enter your answer to your security question'
                            }
                        ]
                    }
                }
            });
    });