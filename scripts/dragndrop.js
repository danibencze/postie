(function () {

    var dropZone = document.getElementById('dropZone');

    function showDropZone() {
        dropZone.style.visibility = "visible";
    }
    function hideDropZone() {
        dropZone.style.visibility = "hidden";
    }

    function allowDrag(e) {
        if (true) {  // Test that the item being dragged is a valid one
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        hideDropZone();
        for (const f of event.dataTransfer.files) {
            // Using the path attribute to get absolute file path
            console.log('File Path of dragged files: ', f.path);
            if(f.path.includes(".postie")){
                var reloaded_data = JSON.parse(fs.readFileSync(f.path, 'utf8'));
                console.log(JSON.parse(fs.readFileSync(f.path, 'utf8')));
                var node = document.createElement("LI");
                var datastore = document.createElement("DIV");
                datastore.innerText = JSON.stringify(reloaded_data);
                datastore.classList.add("datastore");
                node.appendChild(datastore);
                console.log(node);
                reload_history_elem(node);
            }else{
                alert("Only .postie extension files are supported");
            }

        }
    }

    // 1
    window.addEventListener('dragenter', function(e) {
        showDropZone();
    });

    // 2
    dropZone.addEventListener('dragenter', allowDrag);
    dropZone.addEventListener('dragover', allowDrag);

    // 3
    dropZone.addEventListener('dragleave', function(e) {
        hideDropZone();
    });

    // 4
    dropZone.addEventListener('drop', handleDrop);
})();