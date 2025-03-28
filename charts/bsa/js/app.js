document.addEventListener('DOMContentLoaded', function() {
    // Select all the anchor tags with class 'box_2' or 'box_3'
    const boxes = document.querySelectorAll('[data-color]');
    
    // Loop through each element
    boxes.forEach(function(box) {
        // Get the color value from the data-color attribute
        const color = box.getAttribute('data-color');
        
        // Set the background color of the element
        box.style.backgroundColor = color;
    });
});