const canvas = new fabric.Canvas('c', {
    width: 800,
    height: 600,
    preserveObjectStacking: true
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


const parts = [
    { url: 'head.png', angle: 0, offsetX: -100, offsetY: -200 }, // 
    { url: 'left_hand.png', angle: 0, offsetX: -200, offsetY: 0 }, // 
    { url: 'right_hand.png', angle: 0, offsetX: 200, offsetY: 0 }, // 
    { url: 'left_foot.png', angle: 0, offsetX: -100, offsetY: 100 }, // 
    { url: 'right_foot.png', angle: 0, offsetX: 100, offsetY: 100 } // 
];

parts.forEach(part => {
    fabric.Image.fromURL(part.url, function (img) {
        const scale = 0.28;
        img.set({
            left: (canvas.width / 2) + part.offsetX,
            top: (canvas.height / 2) + part.offsetY,
            scaleX: scale,
            scaleY: scale,
            angle: part.angle,
            hasControls: true
        });
        canvas.add(img);
    }, { crossOrigin: 'anonymous' });
});


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
