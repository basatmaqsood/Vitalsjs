window.onload = function() {
  const pie = document.querySelectorAll('.pie');
  pie.forEach((pie, index) => {
    const slices = pie.querySelectorAll('.slice');
    const totalSlices = slices.length;
    const angle = 360 / totalSlices; // Calculate the angle for each slice
      console.log(totalSlices)
    slices.forEach((slice, index) => {
      // Set the rotation for each slice
      const rotationAngle = angle * index;
  
      // Set the background color from data-color attribute
      const color = slice.dataset.color;
  
      slice.style.backgroundColor = color;
      slice.style.transform = `rotate(${rotationAngle}deg)`;
  
      // Optionally, add an event listener for interactivity
      slice.addEventListener('click', function() {
        alert(`You clicked on slice ${index + 1}`);
      });
    });
  });

    const slices = document.querySelectorAll('.pieCircle');
    const totalSlices = slices.length;
    const angle = 360 / totalSlices; // Calculate the angle for each slice
      console.log(totalSlices)
    slices.forEach((slice, index) => {
      // Set the rotation for each slice
      const rotationAngle = angle * index;
  
      // Set the background color from data-color attribute
      const color = slice.dataset.color;
  
      slice.querySelector('a').style.backgroundColor = color;
      // slice.style.transform = `rotate(${rotationAngle}deg)`;
      // slice.querySelector('a').style.transform = `rotate(-${rotationAngle + 10}deg)`;
  
      // Optionally, add an event listener for interactivity
      slice.addEventListener('click', function() {
        alert(`You clicked on slice ${index + 1}`);
      });
    });
};
