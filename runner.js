const fs = require('fs');
var path = require("path");
const electron = require('electron');
      //init appdata to store metadata locally
      const userDataPath = (electron.app || electron.remote.app).getPath(
        'userData'
      );
var obj = JSON.parse(fs.readFileSync(path.join(userDataPath,'status.json'), 'utf8'));
document.getElementById("parse_url").value = obj["current_url"];
document.getElementById("request_type").value = obj["current_request_type"];
console.log(obj);
var os = require('os');
try {
    // get recommended number of threads based on number of cores
    // divided by two as that count include virtual threads as well...
    document.getElementById("threads").value = parseInt(os.cpus().length/2);
}catch (e) {
    console.log(e)
}

function create_result_element(result) {
    var node = document.createElement("LI");
    node.classList.add("list-group-item");
    node.style.padding = 0; //To remove padding inheritance from list-group-item class
    node.innerText = result;
    var list = document.getElementById("runner_result_scroll");
    list.insertBefore(node, list.childNodes[0]);
}

function square(x) {
    console.log(x+" Done");
    var test = x * x;
    return x;
}

function call_api(mock){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlHttp = new XMLHttpRequest();
    var start = Date.now();
    xmlHttp.open(mock[2],mock[1], false);
    xmlHttp.send();
    return [mock[0],xmlHttp.status,(Date.now()-start)]
}


function map_processes(){
    reset_progress();
    var url = document.getElementById("parse_url").value;
    const Pool = require('multiprocessing').Pool;
    const pool = new Pool(parseInt(document.getElementById("threads").value));
    create_progress_child(pool["workers"].length+" workers initialised");
    var list = [];
    var req_count = document.getElementById("iterations").value;
    create_progress_child("Sending "+req_count + " requests");
    var http_method = $("#request_type :selected").text();
    for (var i = 1; i <= req_count; i++) {
        var interlist = [];
        interlist.push(i);
        interlist.push(url);
        interlist.push(http_method);
        list.push(interlist);
    }
    var startrunner = Date.now();
    var pid =[];
    var latency = [];
    var return_code = [];
    pool.map(list, call_api, {onResult: val => { create_result_element("Timestamp: "+Date.now().toString()+": PID -> "+val[0]+", Code ->"+val[1]+", Time -> "+val[2]+"ms" ),pid.push(val[0]),latency.push(val[2]),return_code.push(val[1]),create_graph(pid,latency,return_code)}})
    .then(() => create_progress_child("Finished all requests in "+ ((Date.now()-startrunner)/1000)+" seconds"));
}

function create_graph(pid,latency,return_code) {
    var ctx = document.getElementById('myChart').getContext('2d');
            Chart.defaults.global.responsive = true;
            Chart.defaults.global.maintainAspectRatio = false;
            Chart.defaults.global.animation.duration = 0;
            var chart = new Chart(ctx, {
                // The type of chart we want to create
                type: 'line',
                responsive:true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },

                // The data for our dataset
                data: {
                    labels: pid,
                    datasets: [{
                        label: 'Response time (ms)',
                        borderColor: '#17a2b8',
                        data: latency
                    },{
                        label: 'Return code (http codes)',
                        borderColor: '#5ab879',
                        data: return_code
                    }
                    ]
                },

                // Configuration options go here
                options: {
                    elements: {
                        line: {
                            tension: 0
                        }
                    }}
            });
}

function map_processes_basic(){
    const Pool = require('multiprocessing').Pool;
    const pool = new Pool(4);  // spawns 4 child processes to complete your jobs
    var list = [];
    var url = document.getElementById("parse_url").value;
    for (var i = 1; i <= 100; i++) {
        list.push(i);
    }
    var result =[];
    pool.map(list, call_api, {onResult: val => { document.getElementById("result_holder").innerHTML+= Date.now().toString()+": "+val+", <br>" }})
    .then(() => console.log(result));
}

function map_processes_old_advanced(){
    var start = Date.now();
    const Pool = require('multiprocessing').Pool;
    const pool = new Pool(4);  // spawns 4 child processes to complete your jobs
    var list = [];
    for (var i = 1; i <= 5000; i++) {
        list.push(i);
    }
    var result =[];
    pool.map(list, square, {onResult: val => { document.getElementById("result_holder").innerHTML+= Date.now()+": "+result+", " }})
    .then(() => console.log(result));
    document.getElementById("multitime").innerHTML += (Date.now() - start)+", ";
    var siglestart = Date.now();
    for (var i = 1; i <= 5000; i++) {
        square(i);
        document.getElementById("single_holder").innerHTML += Date.now()+", "
    }
    document.getElementById("normaltime").innerHTML += (Date.now() - siglestart)+", ";

}

function map_processes_old(){
    var start = Date.now();
    const Pool = require('multiprocessing').Pool;
    const pool = new Pool(6);  // spawns 4 child processes to complete your jobs
    var list = [];
    for (var i = 1; i <= 1000; i++) {
        list.push(i);
    }
    pool.map(list, square).then(result => document.getElementById("result_holder").innerHTML+= Date.now()+": "+result+", ");
    document.getElementById("multitime").innerHTML += (Date.now() - start)+", ";
    var siglestart = Date.now();
    for (var i = 1; i <= 10000; i++) {
        square(i)
    }
    document.getElementById("normaltime").innerHTML += (Date.now() - siglestart)+", ";

}


function create_progress_child(content) {
    var child = document.createElement('li');
    child.innerHTML = content;
    child.classList.add("active");
    child.classList.add("breadcrumb-item");
    document.getElementById('runner_tracker').appendChild(child);
}

function reset_progress() {
    document.getElementById("runner_tracker").innerHTML="";
}