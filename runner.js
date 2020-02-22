function square(x) {
    console.log(x+" Done");
    var test = x * x;
    return x;
}

function call_api(mock){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlHttp = new XMLHttpRequest();
    var start = Date.now();
    xmlHttp.open( "GET", "http://127.0.0.1:5000/", false);
    xmlHttp.send();
    return mock +" -> "+xmlHttp.status + " -> "+ (Date.now()-start)+"ms"
}


function map_processes(){
    const Pool = require('multiprocessing').Pool;
    const pool = new Pool(4);  // spawns 4 child processes to complete your jobs
    var list = [];
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
