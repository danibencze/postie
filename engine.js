function sendrequest() {
    reset_progress();
    var url = document.getElementById("parse_url").value;
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
    xmlHttp.open( $("#request_type :selected").text(), url, false);
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
    create_history(url,xmlHttp.status);
    create_progress_child("Time: "+Math.round((t1 - t0))+" ms");
    create_progress_child("Status: "+xmlHttp.status);
    create_progress_child("Headers: "+(xmlHttp.getAllResponseHeaders().split(/:+\s/).length-1));
    create_progress_child("Response: "+xmlHttp.response.length+" char");
    document.getElementById("return_headers").innerText = xmlHttp.getAllResponseHeaders();
    editor.setValue(xmlHttp.response);
    var returnheader = xmlHttp.getResponseHeader("content-type");
    if (returnheader==="application/json" || returnheader.includes("json")){
        editor.session.setMode("ace/mode/javascript");
        btfy();
    }else if (returnheader.includes("xml")){
        editor.session.setMode("ace/mode/xml");
    }else if (returnheader==="application/html"||returnheader ==="text/html"){
        editor.session.setMode("ace/mode/html");
    } else{
        editor.session.setMode("ace/mode/plain_text");
    }
    document.getElementById("html_iframe").srcdoc = xmlHttp.response;
    document.getElementById("raw_response").value = xmlHttp.response;
    save_all();
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

function reset_progress() {
    document.getElementById("tracker").innerHTML="";
}

function reset_ui() {
    document.getElementById("tracker").innerHTML="Ready";
    editor.session.setValue("");
    document.getElementById("return_headers").innerHTML="";
    document.getElementById("raw_response").innerHTML="";
    document.getElementById("html_iframe").srcdoc="";
    body_editor.session.setValue("");
    document.getElementById("headers_modal_content").innerHTML="";

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
      body_length_count()
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

function reset_cache() {
    document.getElementById("cache_dlt_btn").innerHTML ="<img style='height: 15px;width: 100px' src='build/loader.gif'>";
    var rimraf = require("rimraf");
    rimraf(userDataPath, function () {
        const remote = require('electron').remote;
        remote.app.relaunch();
        remote.app.exit(0);
    });
}

function create_history(url,status) {
    if(document.getElementById("minimal_track").checked) {
        var node = document.createElement("LI");
        node.classList.add("list-group-item");
        node.setAttribute("onclick", "reload_history_elem(this)");
        var pres_url = document.createElement("B");
        var status_indicator = document.createElement("SPAN");
        if (status.toString().indexOf("2") === 0) {
            status_indicator.style.color = "#28a745";
        } else {
            status_indicator.style.color = "#dc3545";
        }
        status_indicator.innerText = status;
        node.appendChild(status_indicator);
        pres_url.appendChild(document.createTextNode(url));
        node.appendChild(pres_url);
        var d = Date.now();
        d = new Date(d);
        d = (d.getDate() + '/' + d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + (d.getHours() > 12 ? d.getHours() - 12 : d.getHours()) + ':' + d.getMinutes() + ' ' + (d.getHours() >= 12 ? "PM" : "AM");
        node.appendChild(document.createTextNode(d));
        var list = document.getElementById("history_scroll");
        list.insertBefore(node, list.childNodes[0]);
    }
}

function reload_history_elem(element){
    reset_ui();
    document.getElementById("parse_url").value = element.innerText.split("\n")[1]

}

function dev_console() {
    const remote = require('electron').remote;
    remote.BrowserWindow.getFocusedWindow().webContents.openDevTools();
    console.log(remote.app.mainWindow)
}
