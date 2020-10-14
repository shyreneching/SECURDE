$(document).ready(function(){
    setInterval(check, 1000)
})

function check(){
    var url = "/isValidSession";
    $.ajax({
        async : false,
        url : url,
        type : "POST",
        dataType: "json",
        success: function(data){
            if(data['message']==='no'){
                window.location.replace("/session-timeout")
            }
            // console.log(data['message'])
        }
    })
}