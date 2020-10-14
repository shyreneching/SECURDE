$(document)
    .ready(function () {

        var res_ans = true

        function changeAns(param){
            res_ans = param
        }

        $.fn.form.settings.rules.isAnsCorrect = function(param) {
            var url = "/isAnsCorrect";
            $.ajax({
                async : false,
                url : url,
                type : "POST",
                data : {
                    answer : param.trim(),
                    email : $("#security_question").data("email")
                },
                dataType: "json",
                success: function(data){
                    if(data['message']==='correct'){
                        changeAns(true);
                    }else {
                        changeAns(false);
                    }
                    console.log(data['message'])
                }
            })
            return res_ans
        }

        switch($("#security_question").data("question")){
            case "question_one":
                $("#security_question").text("In what city did you have your first ever birthday party?")
                break
            case "question_two":
                $("#security_question").text("What is the last name of your Science class teacher in high school?")
                break
            case "question_three":
                $("#security_question").text("Which company manufactured your first mobile phone?")
                break
            case "question_four":
                $("#security_question").text("Who was your childhood hero?")
                break
            case "question_five":
                $("#security_question").text("Where was your best family vacation?")
                break
        }

        $('.ui.form')
            .form({
                fields: {
                    security_answer: {
                        identifier: 'security_answer',
                        rules: [{
                                type: 'empty',
                                prompt: 'Please enter your answer to your security question'
                            }, {
                                type: 'isAnsCorrect',
                                prompt: 'Answer is incorrect.'
                            }
                        ]
                    }
                }
            });
    });