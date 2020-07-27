(function () {

// document.addEventListener('drop', (event) => {
//     event.preventDefault();
//     event.stopPropagation();
//
//     for (const f of event.dataTransfer.files) {
//         // Using the path attribute to get absolute file path
//         console.log('File Path of dragged files: ', f.path)
//       }
// });
//
// document.addEventListener('dragover', (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   });
//
// document.addEventListener('dragenter', (event) => {
//     console.log('File is in the Drop Space');
// });
//
// document.addEventListener('dragleave', (event) => {
//     console.log('File has left the Drop Space');
// });
//     // var holder = document.getElementById('mainbod');
//     //
//     // holder.ondragover = () => {
//     //     document.getElementById("main").style.display ="none";
//     //     console.log("ondragover");
//     //     return false;
//     // };
//     //
//     // holder.ondragleave = () => {
//     //     console.log("ondragleave");
//     //     document.getElementById("main").style.display ="inline-flex";
//     //     return false;
//     // }.timeout;
//     //
//     // holder.ondragend = () => {
//     //     return false;
//     // };
//     //
//     // holder.ondrop = (e) => {
//     //     e.preventDefault();
//     //     document.getElementById("main").style.display ="inline-flex";
//     //   for (let f of e.dataTransfer.files) {
//     //       console.log('File(s) you dragged here: ', f.path)
//     //   }
//     //
//     //   return false;
//     // };
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
        console.log('File Path of dragged files: ', f.path)
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