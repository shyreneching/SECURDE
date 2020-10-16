var interval = null;
$(document).ready(function(){
    interval = setInterval(check, 1000)

    $('a[href="/logout"]').on('click',()=>{
        clearInterval(interval);
    })
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
            console.log(data['message'])
        }
    })
}