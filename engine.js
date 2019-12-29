function sendrequest() {
    reset_ui();
    if (testurl(document.getElementById("parse_url").value)){
        create_progress_child("URL: ok")
    }else{
        create_progress_child("URL: Schema not correct");
        return false
    }
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onerror = function (errorc){console.log("error")};
    xmlHttp.onreadystatechange = function (oEvent) {
        console.log(oEvent);
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
              console.log(xmlHttp.responseText)
            } else {
               console.log("Error", xmlHttp.statusText);
            }
        }
    };

    var all_headers_list = document.getElementById("headers_modal_content").children;
    xmlHttp.open( $("#request_type :selected").text(), document.getElementById("parse_url").value, false );
    for (var index = 0; index < all_headers_list.length; ++index) {
        var main_id = all_headers_list[index].id;
        xmlHttp.setRequestHeader(document.getElementById(main_id+"_key").value, document.getElementById(main_id+"_value").value);

    }
    if ($("#content_type :selected").val()!="0"){
        xmlHttp.setRequestHeader("Content-Type",$("#content_type :selected").val())
    }
    var t0 = performance.now();
    try {
        xmlHttp.send(JSON.stringify(body_editor.session.getValue()));
    }catch (e) {
        console.log("error catch")
    }
    if(xmlHttp.status===0){
        create_progress_child("ERROR: Couldn't reach the server")
    }
    var t1 = performance.now();
    document.getElementById("return_headers").innerText = xmlHttp.getAllResponseHeaders();
    editor.setValue(xmlHttp.response);
    var returnheader = xmlHttp.getResponseHeader("content-type");
    if (returnheader==="application/json"){
        editor.session.setMode("ace/mode/javascript");
        btfy();
    }else if (returnheader.includes("xml")){
        editor.session.setMode("ace/mode/xml");
    }else if (returnheader==="application/html"||returnheader ==="text/html"){
        editor.session.setMode("ace/mode/html");
    } else{
        editor.session.setMode("ace/mode/plain_text");
    }
    create_progress_child("Time: "+Math.round((t1 - t0))+" ms");
    create_progress_child("Status: "+xmlHttp.status);
    create_progress_child("Response: "+xmlHttp.response.length+" char");
    document.getElementById("html_iframe").srcdoc = xmlHttp.response;
    document.getElementById("raw_response").value = xmlHttp.response;
    return xmlHttp.response;
}

function ajax_request_test() {
    $.ajax({
        url:document.getElementById("parse_url").value,
        type:$("#request_type :selected").text(),
        success:function (result) {
            console.log(result)
        },
        error: function (request,status,error) {
            console.log("AJAXEROR");
            console.log(error);
            console.log(status);
            console.log(request)
        }
    })
}

function testurl(url) {
    return /^(?:http(s)?:\/\/)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(url)

}

function create_progress_child(content) {
    var child = document.createElement('li');
    child.innerHTML = content;
    child.classList.add("active");
    child.classList.add("breadcrumb-item");
    document.getElementById('tracker').appendChild(child);
}

function reset_ui() {
    document.getElementById("tracker").innerHTML="";
}

function headerspopup() {
    
}

var head_modal = document.getElementById("headers_modal");
var body_modal = document.getElementById("body_modal");

// When the user clicks on the button, open the modal
document.getElementById("headers_modal_open").onclick = function() {
  head_modal.style.display = "block";
  document.getElementById("myTabContent").style.display = "none"

};

document.getElementById("body_modal_open").onclick = function() {
  body_modal.style.display = "block";
  document.getElementById("myTabContent").style.display = "none"

};


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == head_modal) {
    head_modal.style.display = "none";
    document.getElementById("myTabContent").style.display = "contents";
      document.getElementById("totalheaders").innerText=document.getElementById("headers_modal_content").childElementCount;
  }else if(event.target == body_modal){
      body_modal.style.display = "none";
      document.getElementById("myTabContent").style.display = "contents";
      document.getElementById("bodylength").innerText = body_editor.session.getValue().length;
  }
};

function remove_header(id) {
    document.getElementById(id).remove();

}

//This is the funkiest function I have ever written....
function add_header() {
    var make_id = document.getElementById("headers_modal_content").childElementCount+1+"_header";
    // In the ide it might say jquery($) is not imported but it will inherit the import from index.html so dw
    $("#headers_modal_content").append("<div id='"+make_id+"' class=\"input-group\">\n" +
        "              <div style='margin-bottom: 5%' class=\"input-group-prepend\">\n" +
        "                <span onclick='remove_header(\""+make_id+"\")' style='background-color: rgba(177,0,0,0.79);cursor: pointer;color: white' class=\"input-group-text\" >-</span>\n" +
        "                <span class=\"input-group-text\" >Key & value</span>\n" +
        "              </div>\n" +
        "              <input id='"+make_id+"_key"+"' type=\"text\" class=\"form-control\">\n" +
        "              <input id='"+make_id+"_value"+"' type=\"text\" class=\"form-control\">\n" +
        "            </div>");
}

//handles editor body type highlighting
$('#content_type').on('change', function() {
  if(this.value == "application/json"){
      body_editor.session.setMode("ace/mode/javascript");
  }else if(this.value == "application/xml"){
      body_editor.session.setMode("ace/mode/xml");
  }else if (this.value == "text/html"){
      body_editor.session.setMode("ace/mode/html");
  }else{
      body_editor.session.setMode("ace/mode/plain_text");
  }
});
