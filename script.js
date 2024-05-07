const canvas = new fabric.Canvas('c', {
    width: 800,
    height: 600,
    preserveObjectStacking: true
});


document.getElementById('deleteObject').addEventListener('click', function () {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.requestRenderAll();
    }
});

document.getElementById('upload').addEventListener('change', function (e) {
    const reader = new FileReader();
    reader.onload = function (event) {
        fabric.Image.fromURL(event.target.result, function (img) {
            let scale = Math.min(
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

// Function to add or duplicate parts
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
            img.on('mousedown', function (e) {
                if (e.e.button === 2) { // Right click to remove part
                    canvas.remove(img);
                    canvas.requestRenderAll();
                }
            });
        }, { crossOrigin: 'anonymous' });
    });
}

document.getElementById('addLimbs').addEventListener('click', function () {
    addParts(true); // Duplicate parts
});

const parts = [
    { url: 'head.png', angle: 0, offsetX: -100, offsetY: -200 },
    { url: 'left_hand.png', angle: 0, offsetX: -200, offsetY: 0 },
    { url: 'right_hand.png', angle: 0, offsetX: 150, offsetY: 0 },
    { url: 'left_foot.png', angle: 0, offsetX: -100, offsetY: 100 },
    { url: 'right_foot.png', angle: 0, offsetX: 100, offsetY: 100 }
];

// Initially add parts when the page loads
addParts();

document.getElementById('generate').addEventListener('click', function () {
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
    });
    const imageWindow = window.open();
    if (imageWindow) {
        imageWindow.document.write('<img src="' + dataURL + '" alt="Generated Image"/>');
    } else {
        alert('Popup blocked! Please allow popups for this website.');
    }
});

// Prevent the context menu on right-click over the canvas
canvas.on('mouse:down', function (e) {
    if (e.e.button === 2) {
        e.e.preventDefault();
    }
});
