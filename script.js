const canvas = new fabric.Canvas('c', {
    width: 800,
    height: 600,
    preserveObjectStacking: true
});
canvas.setBackgroundColor('#fff', canvas.renderAll.bind(canvas));

let state = []; // Array to hold the states of canvas
let mods = 0; // Counter to keep track of states

function saveState() {
    const stateData = JSON.stringify(canvas); // Serialize canvas state
    state.push(stateData);
    mods += 1;
}

canvas.on('object:added', function () {
    saveState(); // Save new state when an object is added
});

canvas.on('object:modified', function () {
    saveState(); // Save state when an object is modified
});

document.getElementById('undo-drawing').addEventListener('click', function () {
    if (mods < 2) return; // Nothing to undo
    state.pop(); // Remove the latest state
    mods -= 1;
    canvas.clear();
    canvas.loadFromJSON(state[state.length - 1], function () {
        canvas.renderAll();
    });
});

document.getElementById('upload').addEventListener('change', function (e) {
    const reader = new FileReader();
    reader.onload = function (event) {
        fabric.Image.fromURL(event.target.result, function (img) {
            const scale = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );
            img.set({
                originX: 'center',
                originY: 'center',
                top: canvas.height / 2,
                left: canvas.width / 2,
                scaleX: scale,
                scaleY: scale,
                selectable: false,
                evented: false
            });
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        });
    };
    reader.readAsDataURL(e.target.files[0]);
});

let drawingState = [];

document.getElementById('toggle-drawing').addEventListener('click', function () {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    if (canvas.isDrawingMode) {
        this.textContent = 'Disable Drawing';
        document.getElementById('color-picker').style.display = 'inline';
        document.getElementById('brush-size').style.display = 'inline';
        document.getElementById('undo-drawing').style.display = 'inline';
        saveDrawingState();
    } else {
        this.textContent = 'Enable Drawing';
        document.getElementById('color-picker').style.display = 'none';
        document.getElementById('brush-size').style.display = 'none';
        document.getElementById('undo-drawing').style.display = 'none';
    }
});

function saveDrawingState() {
    canvas.toJSON((savedState) => {
        drawingState.push(savedState);
    });
}


document.getElementById('addLimbs').addEventListener('click', function () {
    addParts(true);
});

document.getElementById('deleteObject').addEventListener('click', function () {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.requestRenderAll();
    }
});

document.getElementById('color-picker').addEventListener('change', function () {
    canvas.freeDrawingBrush.color = this.value;
});

document.getElementById('brush-size').addEventListener('input', function () {
    canvas.freeDrawingBrush.width = parseInt(this.value, 10);
});

function addParts(isDuplicate = false) {
    const offsetMultiplier = isDuplicate ? 2 : 1;
    parts.forEach(part => {
        fabric.Image.fromURL(part.url, function (img) {
            const scale = 0.28;
            img.set({
                left: (canvas.width / 2) + part.offsetX * offsetMultiplier,
                top: (canvas.height / 2) + part.offsetY * offsetMultiplier,
                scaleX: scale,
                scaleY: scale,
                angle: part.angle,
                hasControls: true
            });
            canvas.add(img);
        }, { crossOrigin: 'anonymous' });
    });
}

const parts = [
    { url: 'head.png', angle: 0, offsetX: -100, offsetY: -200 },
    { url: 'left_hand.png', angle: 0, offsetX: -200, offsetY: 0 },
    { url: 'right_hand.png', angle: 0, offsetX: 150, offsetY: 0 },
    { url: 'left_foot.png', angle: 0, offsetX: -100, offsetY: 100 },
    { url: 'right_foot.png', angle: 0, offsetX: 100, offsetY: 100 }
];

window.onload = function () {
    addParts();  
}

function getCanvasBounds(canvas) {
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

    // Check background image bounds if it exists and is set as centered
    if (canvas.backgroundImage) {
        const img = canvas.backgroundImage;
        const imgWidth = img.width * img.scaleX;
        const imgHeight = img.height * img.scaleY;
        const imgLeft = (canvas.width / 2) - (imgWidth / 2);
        const imgTop = (canvas.height / 2) - (imgHeight / 2);

        minX = Math.min(minX, imgLeft);
        minY = Math.min(minY, imgTop);
        maxX = Math.max(maxX, imgLeft + imgWidth);
        maxY = Math.max(maxY, imgTop + imgHeight);
    }

    // Include all other objects in the calculation
    canvas.forEachObject((obj) => {
        obj.setCoords(); // Update coordinates of the object
        const bound = obj.getBoundingRect(true);
        minX = Math.min(minX, bound.left);
        minY = Math.min(minY, bound.top);
        maxX = Math.max(maxX, bound.left + bound.width);
        maxY = Math.max(maxY, bound.top + bound.height);
    });

    return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
}

document.getElementById('generate').addEventListener('click', function () {
    const bounds = getCanvasBounds(canvas);

    // Adjust canvas viewport and size temporarily for saving
    canvas.setViewportTransform([1, 0, 0, 1, -bounds.left, -bounds.top]);
    canvas.setWidth(bounds.width);
    canvas.setHeight(bounds.height);

    // Render and save the image
    canvas.renderAll();
    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
    });

    // Reset the viewport and canvas size after saving
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setWidth(800);
    canvas.setHeight(600);
    canvas.renderAll();

    // Open the image in a new window
    const imageWindow = window.open();
    if (imageWindow) {
        imageWindow.document.write('<img src="' + dataURL + '" alt="Generated Image"/>');
    } else {
        alert('Popup blocked! Please allow popups for this website.');
    }
});
