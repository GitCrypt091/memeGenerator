const canvas = new fabric.Canvas('c', {
    width: 800,  
    height: 600, 
    preserveObjectStacking: true
});
const text = new fabric.Text('I am just a random passerby, found mini interesting, the code is open source, and I hope the CTO can add some nice backgrounds.', {
    left: 10, 
    top: canvas.height - 40, 
    fontSize: 16,
    fill: 'black' 
});

canvas.add(text);
canvas.renderAll();
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
    { url: 'head.png', angle: 90, offsetX: -150, offsetY: -200 }, // 
    { url: 'left_hand.png', angle: 210, offsetX: -300, offsetY: 0 }, // 
    { url: 'right_hand.png', angle: 330, offsetX: 300, offsetY: 0 }, // 
    { url: 'left_foot.png', angle: 270, offsetX: -200, offsetY: 200 }, // 
    { url: 'right_foot.png', angle: 30, offsetX: 200, offsetY: 200 } // 
];

parts.forEach(part => {
    fabric.Image.fromURL(part.url, function (img) {
        const scale = 0.1; 
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


// 生成图片
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
