var path = require("path");
var fs = require('fs');
var current_request = "";

const debounce = (func, delay) => {
  let inDebounce;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func.apply(context, args), delay)
  }
};

const electron = require('electron');
//init appdata to store metadata locally
const userDataPath = (electron.app || electron.remote.app).getPath(
  'userData'
);

console.log(userDataPath);


$("#parse_url").on('keyup', function (e) {
  if (e.keyCode === 13) {
      sendrequest();
      }
});

function btfy() {
    //console.log(editor.session.getMode().$id);
    if(editor.session.getMode().$id==="ace/mode/javascript"){
        //console.log("btfy:OK");
        var val = editor.session.getValue();
      //Remove leading spaces
        var array = val.split(/\n/);
        array[0] = array[0].trim();
        val = array.join("\n");
      //Actual beautify (prettify)
        val = beautify(val);
      //Change current text to formatted text
        editor.session.setValue(val);
    }
}

function settingstoggle(x) {
  x.classList.toggle("change");
  if (x.classList.contains("change")){
    document.getElementById("settings-tab").style.display ="block";
    document.getElementById("main").style.display ="none"
  }else{
    document.getElementById("main").style.display ="inline-flex";
    document.getElementById("settings-tab").style.display ="none";
  }
}

//TODO: Finish off autosave functions
//TODO: Also to load in the saved data
$(".autosave").on("input",debounce(function() {
    //console.log("Change to " + this.value);
    save_all();
},1000));

function getheaders() {
    var headers = [];
    for (let i = 1; i <= document.getElementById("headers_modal_content").children.length; i++) {
        console.log("saving");
        var interheaders = [];
        interheaders.push(document.getElementById(i+"_header_key").value);
        interheaders.push(document.getElementById(i+"_header_value").value);
        headers.push(interheaders)
    }
    return headers
}

function save_all() {
  var content = JSON.stringify({
    "current_url":document.getElementById("parse_url").value,
    "return_content":editor.session.getValue(),
    "headers":getheaders(),
    "return_headers": document.getElementById("return_headers").innerHTML,
    "body":body_editor.session.getValue(),
    "search_bar":document.getElementById("history_filter").value,
    "content_type":document.getElementById("content_type").value,
    "current_request_type":document.getElementById("request_type").value,
    "history-grouping":document.getElementById("history-grouping").checked,
    "history":document.getElementById("history_scroll").innerHTML
  });
  try { fs.writeFileSync(path.join(userDataPath,'status.json'), content, 'utf-8'); }
  catch(e) { console.log(e) }
  var history_option = "";
  if(document.getElementById("minimal_track").checked){
    history_option = "minimal_track"
  }else if(document.getElementById("full_track").checked){
      history_option = "full_track"
  }else{
    history_option = "no_track"
  }
  //console.log(history_option);
  var settings = JSON.stringify({
    "history":history_option,
  });
  try { fs.writeFileSync(path.join(userDataPath,'settings.json'), settings, 'utf-8'); }
  catch(e) { console.log(e) }
}


function body_length_count() {
document.getElementById("bodylength").innerText = body_editor.session.getValue().length;
}


function startupload() {
  try{
    var obj = JSON.parse(fs.readFileSync(path.join(userDataPath,'status.json'), 'utf8'));
    //console.log(obj["headers"]);
    //TODO: Create function for header creation from arrays
    for (let i = 0; i < obj["headers"].length; i++) {
        //console.log("trying..");
        add_header();
        //console.log("header created");
        document.getElementById((i+1)+"_header_key").value = obj["headers"][i][0];
        document.getElementById((i+1)+"_header_value").value = obj["headers"][i][1];
        //console.log("bits added")
    }
    display_header_count();
    body_editor.session.setValue(obj["body"]);
    document.getElementById("parse_url").value = obj["current_url"];
    document.getElementById("history_filter").value = obj["search_bar"];
    editor.session.setValue(obj["return_content"]);
    document.getElementById("request_type").value = obj["current_request_type"];
    document.getElementById("return_headers").innerText = obj["return_headers"];
    document.getElementById("raw_response").value = obj["return_content"];
    document.getElementById("content_type").value = obj["content_type"];
    document.getElementById("history-grouping").checked = obj["history-grouping"];
    if (obj["history"]) {
      document.getElementById("history_scroll").innerHTML = obj["history"];
    }
    $('#content_type').trigger("change");
    display_header_count();
    btfy();
    body_length_count();
  }catch (e) {
    console.log("No config file found")
  }
  var settings = {};
  try{
    settings = JSON.parse(fs.readFileSync(path.join(userDataPath,'settings.json'), 'utf8'));
  }catch (e) {
    console.log("No settings... going default it is")
  }
  console.log(settings);
  if(settings["history"]){
    document.getElementById(settings["history"]).checked = true;
    document.getElementById(settings["history"]+"_label").classList.add("active");
  }else{
    document.getElementById("full_track").checked = true;
    document.getElementById("full_track_label").classList.add("active")
  }
}

function sendrequest() {
    reset_progress();
    change_to_loader();
    var url = document.getElementById("parse_url").value;
    if (testurl(document.getElementById("parse_url").value)){
        create_progress_child("URL: ok")
    }else{
        create_progress_child("URL: Schema not correct");
        return false
    }
    var xmlHttp = new XMLHttpRequest();
    current_request = xmlHttp;
    xmlHttp.onerror = function (errorc){console.log("error")};
    xmlHttp.onreadystatechange = function (oEvent) {
        //console.log(oEvent);
        if (xmlHttp.readyState === 4) {
                reset_go_button();
                var t1 = performance.now();
                var timedelta = Math.round((t1 - t0));
                if (timedelta >= 1000){
                    create_progress_child("Time: "+(timedelta/1000)+" s");
                }else{
                    create_progress_child("Time: "+timedelta+" ms");
                }
                create_progress_child("Status: "+xmlHttp.status);
                create_progress_child("Headers: "+(xmlHttp.getAllResponseHeaders().split(/:+\s/).length-1));
                create_progress_child("Response: "+xmlHttp.response.length+" char");
                document.getElementById("return_headers").innerText = xmlHttp.getAllResponseHeaders();
                editor.setValue(xmlHttp.response);
                var returnheader = xmlHttp.getResponseHeader("content-type");
                try{
                    if (returnheader==="application/json" || returnheader.includes("json")){
                        editor.session.setMode("ace/mode/javascript");
                        btfy();
                    }else if (returnheader.includes("xml")){
                        editor.session.setMode("ace/mode/xml");
                    }else if (returnheader.includes("html")){
                        editor.session.setMode("ace/mode/html");
                    } else{
                        editor.session.setMode("ace/mode/plain_text");
                    }
                }catch (e) {
                    console.log("No headers")
                }
                document.getElementById("html_iframe").srcdoc = xmlHttp.response;
                document.getElementById("raw_response").value = xmlHttp.response;
                create_history(url,xmlHttp.status);
                save_all();
                return xmlHttp.response;
        }
    };
    var all_headers_list = document.getElementById("headers_modal_content").children;
    //console.log(all_headers_list);
    xmlHttp.open( $("#request_type :selected").text(), url, true);
    for (var index = 0; index < all_headers_list.length; ++index) {
        var main_id = all_headers_list[index].id;
        xmlHttp.setRequestHeader(document.getElementById(main_id+"_key").value, document.getElementById(main_id+"_value").value);

    }
    var content_type= $("#content_type :selected").val();
    //TODO: Content type header not being set
    if (content_type !== "0"){
        console.log("Setting header");
        xmlHttp.setRequestHeader("Content-type",content_type)
    }
    //console.log("headres here");
    console.log(xmlHttp.headers);
    try {
        //TODO: Fix this weird JSON error
        console.log(body_editor.session.getValue());
        var payload = body_editor.session.getValue();
        console.log(payload);
        var t0 = performance.now();
        xmlHttp.send(payload);
    }catch (e) {
        console.log("error catch")
    }
}


function change_go_to_abort() {
    document.getElementById("gobutton").innerHTML="<div onmouseout='change_to_loader()' id='abort_request' class='abort'>X</div>";
    document.getElementById("gobutton").style.backgroundColor = "#dc3545";
    document.getElementById("gobutton").onclick = function (){current_request.abort();};
}

function change_to_loader() {
    document.getElementById("gobutton").innerHTML="<div onmouseover='change_go_to_abort()' class='loader'></div>";
    document.getElementById("gobutton").style.backgroundColor = "transparent";
}

function reset_go_button() {
    document.getElementById("gobutton").innerHTML="Go";
    document.getElementById("gobutton").onclick = function (){sendrequest();};
    document.getElementById("gobutton").style.backgroundColor = "transparent";
}


function sendrequest_old() {
    //TODO: add https://forums.asp.net/t/1129474.aspx?How+can+i+use+xmlhttp+to+request+a+https+url
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
        //console.log(oEvent);
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status === 200) {
              //console.log(xmlHttp.responseText)
            } else {
               console.log("Error", xmlHttp.statusText);
            }
        }
    };

    var all_headers_list = document.getElementById("headers_modal_content").children;
    //console.log(all_headers_list);
    xmlHttp.open( $("#request_type :selected").text(), url, true);
    for (var index = 0; index < all_headers_list.length; ++index) {
        var main_id = all_headers_list[index].id;
        xmlHttp.setRequestHeader(document.getElementById(main_id+"_key").value, document.getElementById(main_id+"_value").value);

    }
    var content_type= $("#content_type :selected").val();
    if (content_type !== "0"){
        xmlHttp.setRequestHeader("Content-type",content_type)
    }
    //console.log("headres here");
    //console.log(xmlHttp.headers);
    var t0 = performance.now();
    try {
        //TODO: Fix this weird JSON error
        //console.log(body_editor.session.getValue());
        var payload = body_editor.session.getValue();
        //console.log(payload);
        xmlHttp.send(payload);
    }catch (e) {
        console.log("error catch")
    }
    if(xmlHttp.status===0){
        create_progress_child("ERROR: Couldn't reach the server")
    }
    var t1 = performance.now();
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
    }else if (returnheader.includes("html")){
        editor.session.setMode("ace/mode/html");
    } else{
        editor.session.setMode("ace/mode/plain_text");
    }
    document.getElementById("html_iframe").srcdoc = xmlHttp.response;
    document.getElementById("raw_response").value = xmlHttp.response;
    create_history(url,xmlHttp.status);
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
    document.getElementById("raw_response").value="";
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
    display_header_count();
  }else if(event.target == body_modal){
      body_modal.style.display = "none";
      document.getElementById("myTabContent").style.display = "contents";
      body_length_count()
  }
  save_all();
};

function display_header_count() {
    document.getElementById("totalheaders").innerText=document.getElementById("headers_modal_content").childElementCount;
}


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
    document.getElementById("cache_dlt_btn_loader").innerHTML ="<div class='loader'></div>";
    var rimraf = require("rimraf");
    rimraf(userDataPath, function () {
        const remote = require('electron').remote;
        remote.app.relaunch();
        remote.app.exit(0);
    });
}

function create_history(url,status) {
    if(document.getElementById("minimal_track").checked || document.getElementById("full_track").checked  ) {
        var node = document.createElement("LI");
        node.classList.add("list-group-item");
        node.classList.add("task");
        node.setAttribute("onclick", "reload_history_elem(this)");
        var history_id = "history_"+document.getElementById("history_scroll").children.length.toString();
        node.setAttribute("data-id",history_id);
        node.id = history_id;
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
        var month = d.getMonth() + 1;
        d = (d.getDate() + '/' + month) + '/' + d.getFullYear() + ' ' + (d.getHours() > 12 ? d.getHours() - 12 : d.getHours()) + ':' + d.getMinutes() + ' ' + (d.getHours() >= 12 ? "PM" : "AM");
        node.appendChild(document.createTextNode(d));
        if (document.getElementById("full_track").checked){
            var datastore = document.createElement("DIV");
            datastore.innerText = serialize_current_state();
            datastore.style.display = "none";
            datastore.classList.add("datastore");
            datastore.id = history_id+"_store";
            node.appendChild(datastore)
        }
        var list = document.getElementById("history_scroll");
        if(document.getElementById("history-grouping").checked && list.childNodes[0].getElementsByTagName("B")[0].innerText===url){
            var counter = document.createElement("SPAN");
            counter.classList.add("badge");
            counter.classList.add("badge-info");
            counter.classList.add("history_counter");
            var previous_req = list.childNodes[0].getElementsByClassName("badge-info");
            if(previous_req.length ===1){
               counter.innerText=parseInt(previous_req[0].innerText)+1;
            }else{
                counter.innerText=2;
            }
            node.appendChild(counter);
            list.removeChild(list.childNodes[0]);
        }
        list.insertBefore(node, list.childNodes[0]);
    }
}

function filter_history() {
  // Declare variables
  var input, filter, ul, li, b, i, txtValue;
  input = document.getElementById('history_filter');
  filter = input.value.toUpperCase();
  ul = document.getElementById("history_scroll");
  li = ul.getElementsByTagName('li');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    b = li[i].getElementsByTagName("b")[0];
    txtValue = b.textContent || b.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function reload_history_elem(element){
    reset_ui();
    document.getElementById("parse_url").value = element.innerText.split("\n")[1];
    // console.log(element.children);
    if (element.querySelector(".datastore")){
        var history_element = JSON.parse(element.querySelector(".datastore").innerText);
        console.log(history_element);
        document.getElementById("parse_url").value = history_element["url"];
        body_editor.session.setValue(history_element["body"]);
        editor.session.setValue(history_element["return_content"]);
        document.getElementById("content_type").value = history_element["content_type"];
        document.getElementById("raw_response").value = history_element["return_content"];
        document.getElementById("request_type").value = parseInt(history_element["current_request_type"]);
        for (let i = 0; i < history_element["headers"].length; i++) {
              add_header();
              document.getElementById((i+1)+"_header_key").value = history_element["headers"][i][0];
              document.getElementById((i+1)+"_header_value").value = history_element["headers"][i][1];
          }
        var return_hdrs = history_element["return_headers"].split("\n");
        for(let n = 0; n < return_hdrs; n++){
            document.getElementById("return_headers").innerHTML += return_hdrs[n];
            document.getElementById("return_headers").innerHTML += "<br>";
        }
    }
    $('#content_type').trigger("change");
    btfy();
    body_length_count();
    display_header_count();

}

function dev_console() {
    const remote = require('electron').remote;
    remote.BrowserWindow.getFocusedWindow().webContents.openDevTools();
    console.log(remote.app.mainWindow);
    console.log(remote.app.getVersion());
    console.log(remote.app.getAppPath())
}

function update_app() {
    const remote = require('electron').remote;
    var current_version = remote.app.getVersion().replace(/\./g,"");
    console.log(current_version);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "https://api.github.com/repos/danibencze/postie/releases/latest", false);
    xmlHttp.send();
    var most_recent_availible = JSON.parse(xmlHttp.responseText);
    console.log(parseInt(current_version));
    if (parseInt(most_recent_availible["tag_name"].replace(/\./g,""))>parseInt(current_version)){
        console.log("Start update");
        document.getElementById("update_btn").innerHTML ="<div class='loader'></div>";
        console.log(most_recent_availible["assets"][0]["browser_download_url"]);
        document.getElementById('update_btn').onclick = null;
        document.getElementById("update_btn").innerHTML ='A new version is found and can be downloaded from <a id="update_link" href="'+most_recent_availible["assets"][0]["browser_download_url"]+'">here</a>';
        document.getElementById("update_link").click()
    }else{
        console.log("You are up to date");
        document.getElementById("update_btn").style.borderColor = "#28a745";
        document.getElementById("update_btn").innerHTML ="You are up to date";
    }

}

function spawn_runner_window() {
  save_all();
  const remote = require('electron').remote;
  const BrowserWindow = remote.BrowserWindow;
  const win = new BrowserWindow({width: 1000,frame: false, transparent : true, height: 600, backgroundColor: '#FFF',icon: __dirname + 'postielogo/icon.ico',webPreferences: { nodeIntegration: true }});
  win.loadFile('runner.html');
}

function serialize_current_state() {
    return JSON.stringify({
        "url":document.getElementById("parse_url").value,
          "return_content":editor.session.getValue(),
          "headers":getheaders(),
          "return_headers": document.getElementById("return_headers").innerText,
          "body":body_editor.session.getValue(),
          "content_type":document.getElementById("content_type").value,
          "current_request_type":document.getElementById("request_type").value,
    })
}