let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");
let backgroundColors=backgroundColorCont.querySelectorAll("div");
let clearFrame=document.querySelector(".clear-frame");

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = []; //Data
let track = 0; // Represent which action from tracker array

let mouseDown = false;

// API
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// mousedown -> start new path, mousemove -> path fill (graphics)
canvas.addEventListener("mousedown", (e) => {
    if(e.button==0){
        mouseDown = true;
        let data = {
            x: e.clientX,
            y: e.clientY
        }
        socket.emit("beginPath",data);
    }
})
canvas.addEventListener("mousemove", (e) => {
    if (mouseDown) {
        let data = {
            x: e.clientX,
            y: e.clientY,
            color: eraserFlag ? eraserColor : penColor,
            width: eraserFlag ? eraserWidth : penWidth
        }
        socket.emit("drawStroke",data);
    }
})
canvas.addEventListener("mouseup", (e) => {
    if(e.button==0){
        mouseDown = false;

        let url = canvas.toDataURL();
        undoRedoTracker.push(url);
        track=undoRedoTracker.length-1;
    }   
})

undo.addEventListener("click", (e) => {
    if (track>0)
    {
        track--;
    }
    
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    socket.emit("undo",data);
})
redo.addEventListener("click", (e) => {
    if (track < undoRedoTracker.length-1) track++;
    // track action
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    socket.emit("redo",data);
})

function undoRedoCanvas(trackObj) {
    track = trackObj.trackValue;
    undoRedoTracker = trackObj.undoRedoTracker;
    console.log(track);
    console.log(undoRedoTracker);
    let url = undoRedoTracker[track];
    let img = new Image(); // new image reference element
    img.src = url;
    img.onload = (e) => {
        tool.clearRect(0, 0, canvas.width, canvas.height);
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}
function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        penColor = color;
        tool.strokeStyle = penColor;
    })
})

pencilWidthElem.addEventListener("change", (e) => {
    penWidth = pencilWidthElem.value;
    tool.lineWidth = penWidth;
})
eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})
eraser.addEventListener("click", (e) => {
    if (eraserFlag) {
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    } else {
        tool.strokeStyle = penColor;
        tool.lineWidth = penWidth;
    }
})

download.addEventListener("click", (e) => {
    let url = canvas.toDataURL();

    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

backgroundColors.forEach(color => {
    color.addEventListener("click",(e)=>{
        let col=color.classList[0];
        let data={
            backColor: col,
        }
        socket.emit("backgroundCanvas",data);
    })
});

function setBackgroundColorCanvas(data) {
    let col=data.backColor;
    if(col=="blueish"){
        document.body.style.backgroundColor="#273c75";
    }else if(col=="blackish"){
        document.body.style.backgroundColor="#1e272e";
    }else{
        document.body.style.backgroundColor=col;
    }
}
clearFrame.addEventListener("click",(e)=>{
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    socket.emit("clearFrame",data);
})

function clear(data) {
    tool.clearRect(0,0,canvas.width,canvas.height);

    track=data.trackValue;
    undoRedoTracker=data.undoRedoTracker;
    track=0;
    undoRedoTracker=[];
}

socket.on("beginPath", (data) => {
    beginPath(data);
})
socket.on("drawStroke", (data) => {
    drawStroke(data);
})
socket.on("undo", (data) => {
    undoRedoCanvas(data);
})
socket.on("redo", (data) => {
    undoRedoCanvas(data);
})
socket.on("backgroundCanvas", (data) => {
    setBackgroundColorCanvas(data);
})
socket.on("clearFrame",(data)=>{
    clear(data);
})

