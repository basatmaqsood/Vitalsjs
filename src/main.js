const encoder = new TextEncoder();
 
// Function to safely calculate the length of a variable
function getVariableLength(value) {
    if (value === null || value === undefined) {
        return 0; // No length for null or undefined 
    } else if (typeof value === "string" || Array.isArray(value)) {
        return value.length; // Works for strings and arrays
    } else if (typeof value === "object") {
        return Object.keys(value).length; // Count keys in objects
    } else {
        return String(value).length; // Convert other types (e.g., numbers) to string and get length
    }
}  

// Function to convert a length into binary
function convertToBinary(value, name) {
    let length = getVariableLength(value); // Get the variable's length safely
    //console.log(`${name} length:`, length); // Log the length

    let binaryArray = length.toString(2).padStart(8, '0'); // Convert length to binary
    console.log(`${name} binary length:`, binaryArray);
    return binaryArray;
}

var nodval = convertToBinary(window.nodval, 'nodval');
var in$1val = convertToBinary(window.in$1val, 'in$1val');
var comGval = convertToBinary(window.comGval, 'comGval');
var gpuBval = convertToBinary(window.gpuBval, 'gpuBval');
var resWval = convertToBinary(window.resWval, 'resWval');
var ecmaval = convertToBinary(window.ecmaval, 'ecmaval');
var kworval = convertToBinary(window.kworval, 'kworval');
var kwROval = convertToBinary(window.kwROval, 'kwROval');
var nIDval = convertToBinary(window.nIDval, 'nIDval');
var astrval = convertToBinary(window.astrval, 'astrval');
var posval = convertToBinary(window.posval, 'posval');
var ttokval = convertToBinary(window.ttokval, 'ttokval');
var typval = convertToBinary(window.typval, 'typval');
var lBval = convertToBinary(window.lBval, 'lBval');
var skwsval = convertToBinary(window.skwsval, 'skwsval');
var refval = convertToBinary(window.refval, 'refval');
var hoprval = convertToBinary(window.hoprval, 'hoprval');
var isarrval = convertToBinary(window.isarrval, 'isarrval');
var posival = convertToBinary(window.posival, 'posival');
var celocval = convertToBinary(window.celocval, 'celocval');
var matcval = convertToBinary(window.matcval, 'matcval');
var defaval = convertToBinary(window.defaval, 'defaval');
var parval = convertToBinary(window.parval, 'parval');
var ptacval = convertToBinary(window.ptacval, 'ptacval');
var plugval = convertToBinary(window.plugval, 'plugval');
var ppval = convertToBinary(window.ppval, 'ppval');
var nexval = convertToBinary(window.nexval, 'nexval');
var waitval = convertToBinary(window.waitval, 'waitval');
var init$val = convertToBinary(window.init$val, 'init$val');
var curval = convertToBinary(window.curval, 'curval');
var empval = convertToBinary(window.empval, 'empval');



document.querySelector('#startCharts').addEventListener('click', onRecord);
//new main.js    
/*
const app = initializeApp(firebaseConfig); 
const db = getFirestore(app); 
 
// Get a list of cities from your database
async function getCities(db) {
  const citiesCol = collection(db, 'cities');  
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}*/    
       
   
    
const inProduction = false; // hide video and tmp canvas
const channel = 'r'; // red only, green='g' and blue='b' channels can be added

let video, c_tmp, ctx_tmp; // video from rear-facing-camera and tmp canvas
let frameCount = 0; // count number of video frames processed 
let delay = 0; // delay = 100; should give us 10 fps, estimated around 7
let numOfQualityFrames = 0; // TODO: count the number of quality frames
let xMeanArr = [];
let xMean = 0;
let initTime;
let isSignal = 0;
let acFrame = 0.008; // start with dummy flat signal
let acWindow = 0.008;
let nFrame = 0;
const WINDOW_LENGTH = 300; // 300 frames = 5s @ 60 FPS
let acdc = Array(WINDOW_LENGTH).fill(0.5);
let ac = Array(WINDOW_LENGTH).fill(0.5);
var fval=0;
let isPrinting = false;
let allValues = [];
// draw the signal data as it comes
let lineArr = [];
const MAX_LENGTH = 100;
const DURATION = 100;
let chart = realTimeLineChart();
var pwrval=0;
var zramval=0;
var gdval;
var lonval;
var latval;
let constraintsObj = {
  audio: false,
  video: {
    maxWidth: 1280,
    maxHeight: 720,
    frameRate: { ideal: 60 },
    facingMode: 'environment' // rear-facing-camera
  }
}; 

function setWH() {
  let [w, h] = [video.videoWidth, video.videoHeight];
  document.getElementById('solar-nuclear-photovoltaic-delay').innerHTML = `Frame compute delay: ${delay}`;
  document.getElementById('solar-nuclear-photovoltaic-resolution').innerHTML = `Video resolution: ${w} x ${h}`;
  c_tmp.setAttribute('width', w);
  c_tmp.setAttribute('height', h); 
}

function init() {
  c_tmp = document.getElementById('output-canvas');
  c_tmp.style.display = 'none';
  if (inProduction) {
    c_tmp.style.display = 'none';
  }
  ctx_tmp = c_tmp.getContext('2d');
}
/***MAP****/

// Initialize the WorldWind globe
/*
var wwd = new WorldWind.WorldWindow("global");

// Add base layers
wwd.addLayer(new WorldWind.BMNGOneImageLayer());
wwd.addLayer(new WorldWind.BMNGLandsatLayer());

// Add additional layers for user interface
wwd.addLayer(new WorldWind.CompassLayer());
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
gdval=wwd.navigator.range;
// Check if Geolocation API is available
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            // Get user's coordinates
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            
            latval = position.coords.latitude;
            lonval = position.coords.longitude; 
            // Center the globe to the user's location
            wwd.navigator.lookAtLocation.latitude = latitude;
            wwd.navigator.lookAtLocation.longitude = longitude;
            wwd.navigator.range = 1e7; // Adjust zoom level (optional)

            // Add a placemark for the user's location
            var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
            placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/pushpins/plain-red.png";
            placemarkAttributes.imageScale = 0.8;

            var placemarkPosition = new WorldWind.Position(latitude, longitude, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);

            var placemarkLayer = new WorldWind.RenderableLayer("User Location");
            placemarkLayer.addRenderable(placemark);
            wwd.addLayer(placemarkLayer);

            document.getElementById('gdval').innerHTML = `Zoom level: ${gdval}`;
            document.getElementById('latval').innerHTML = `Latitude: ${latval}`;
            document.getElementById('lonval').innerHTML = `Longitude: ${lonval}`;
    
        },
        function (error) {
            console.error("Geolocation error: ", error);
            alert("Unable to access your location. Please ensure location services are enabled.");
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
    alert("Geolocation is not supported by your browser.");
}
*/


/*multi camera */
/*
async function listCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    if (videoDevices.length === 0) {
        alert("No cameras found.");
        return;
    }

    // Create a list of camera names
    let cameraList = "Available Cameras:\n";
    videoDevices.forEach((device, index) => {
        cameraList += `${index + 1}. ${device.label || `Camera ${index + 1}`}\n`;
    });

    // Show the alert
    alert(cameraList);
}

// Call the function to display the camera list
listCameras();


      async function getCameraStream(deviceId) {
            return navigator.mediaDevices.getUserMedia({
                video: { deviceId: deviceId ? { exact: deviceId } : undefined },
                audio: false
            });
        }

        async function startMixing() {
            try {
                // Get all video input devices (including Bluetooth if recognized)
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');

                console.log("Detected Cameras:", videoDevices);

                if (videoDevices.length < 2) {
                    console.error("At least two cameras are required.");
                    return;
                }

                // Select the first two available cameras
                const cam1Id = videoDevices[0].deviceId;
                const cam2Id = videoDevices[1].deviceId;

                // Get streams from two different cameras
                const stream1 = await getCameraStream(cam1Id);
                const stream2 = await getCameraStream(cam2Id);

                // Initialize MultiStreamsMixer
                const mixer = new MultiStreamsMixer([stream1, stream2]);
                mixer.frameInterval = 10; // Optimize performance
                mixer.startDrawingFrames(); // Start mixing video frames

                // Get the final mixed stream
                const mixedStream = mixer.getMixedStream();

                // Attach to video element
                const videoElement = document.getElementById("outputVideo");
                videoElement.srcObject = mixedStream;
                videoElement.play();

                console.log("Mixing Started!");

            } catch (error) {
                console.error("Error accessing cameras:", error);
            }
        }

        // Start the mixing process
        startMixing();



*/

    



function computeFrame(soundfreq) { //console.log(soundfreq)
  if (nFrame > DURATION) {
    ctx_tmp.drawImage(video,
      0, 0, video.videoWidth, video.videoHeight);
    let frame = ctx_tmp.getImageData(
      0, 0, video.videoWidth, video.videoHeight);
  
    // process each frame
    const count = frame.data.length / 4;
    let rgbRed = 0;
    for (let i = 0; i < count; i++) {
      rgbRed += frame.data[i * 4];
    }
    // invert to plot the PPG signal
    xMean = 1 - rgbRed / (count * 255);
    
     if (isPrinting) { 
    ccalc(xMean) 
     }
    let xMeanData = {
      time: (new Date() - initTime) / 1000,
      x: xMean
    };

    acdc[nFrame % WINDOW_LENGTH] = xMean;

    // TODO: calculate AC from AC-DC only each WINDOW_LENGTH time:
    if (nFrame % WINDOW_LENGTH == 0) {
      // console.log(`nFrame = ${nFrame}`);
      // console.log(`ac = ${acdc}`);
      // console.log(`ac-detrended = ${detrend(acdc)}`);
      document.getElementById('solar-nuclear-photovoltaic-signal-window').innerHTML = `nWindow: ${nFrame / WINDOW_LENGTH}`;
      if ((nFrame / 100) % 2 == 0) {
        isSignal = 1;
        ac = detrend(acdc);
        acWindow = windowMean(ac);
      } else {
        ac = Array(WINDOW_LENGTH).fill(acWindow);
        isSignal = 0;
      }
    }

    acFrame = ac[nFrame % WINDOW_LENGTH];

    xMeanArr.push(xMeanData);


   let now = new Date();
let currentDateTime = now.toLocaleString('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});



   
    document.getElementById('solar-nuclear-photovoltaic-frame-time').innerHTML = `Frame time: ${currentDateTime}`;
    document.getElementById('solar-nuclear-photovoltaic-video-time').innerHTML = `Video time: ${(video.currentTime.toFixed(2))}`;
    document.getElementById('solar-nuclear-photovoltaic-signal').innerHTML = `X: ${xMeanData.x}`;
    
    const fps = (++frameCount / video.currentTime).toFixed(3);
    document.getElementById('solar-nuclear-photovoltaic-frame-fps').innerHTML = `Frame count: ${frameCount}, FPS: ${fps}`;

    ctx_tmp.putImageData(frame, 0, 0);
  }
  nFrame += 1;
  setTimeout(computeFrame, delay); // continue with delay
} 

function windowMean(y) {
  const n = y.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += y[i]
  }  

  return sum / n;
}

function detrend(y) {
  const n = y.length;
  let x = [];
  for (let i = 0; i <= n; i++) {
    x.push(i);
  }

  let sx = 0;
  let sy = 0;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < n; i++) {
    sx += x[i];
    sy += y[i];
    sxy += x[i] * y[i];
    sxx += x[i] * x[i];
  }
  const mx = sx / n;
  const my = sy / n;
  const xx = n * sxx - sx * sx;
  const xy = n * sxy - sx * sy;
  const slope = xy / xx;
  const intercept = my - slope * mx;

  detrended = [];
  for (let i = 0; i < n; i++) {
    detrended.push(y[i] - (intercept + slope * i));
  }

  return detrended;
}

function onRecord() {
  this.disabled = true;
  $('#charts').show()
  $('#wrapper').hide()
  navigator.mediaDevices.getUserMedia(constraintsObj)
    .then(function(mediaStreamObj) {

      // we must turn on the LED / torch
      const track = mediaStreamObj.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track)
      const photoCapabilities = imageCapture.getPhotoCapabilities()
        .then(() => {
          track.applyConstraints({
              advanced: [{ torch: true }]
            })
            .catch(err => console.log('No torch', err));
        })
        .catch(err => console.log('No torch', err));

      video = document.getElementById('video');
      if (inProduction) {
        video.style.display = 'none';
      }

      if ("srcObject" in video) {
        video.srcObject = mediaStreamObj;
      } else {
        // for older versions of browsers
        video.src = window.URL.createObjectURL(mediaStreamObj);
      }

      video.onloadedmetadata = function(ev) {
        video.play();
      };

      init();
      video.addEventListener('play', setWH);
      video.addEventListener('play', computeFrame);
      video.addEventListener('play', drawLineChart);

      video.onpause = function() {
        console.log('paused');
      };
    })
    .catch(error => console.log(error));

  
 
}
 
function pauseVideo() {
  video.pause();
  video.currentTime = 0;
}

function seedData() {
  let now = new Date();

  for (let i = 0; i < MAX_LENGTH; ++i) {
    lineArr.push({
      time: new Date(now.getTime() - initTime - ((MAX_LENGTH - i) * DURATION)),
      x: 0.5,
      signal: isSignal
    });
  }
}

function updateData() {
  let now = new Date();

  let lineData = {
    time: now - initTime,
    x: acFrame,
    signal: isSignal
  };
  lineArr.push(lineData);
//console.log(lineData)
  // if (lineArr.length > 1) {
  lineArr.shift();
  // }
  d3.select("#solar-nuclear-photovoltaic-chart").datum(lineArr).call(chart);
} 

function resize() {
  if (d3.select("#chart svg").empty()) {
    return;
  }
  chart.width(+d3.select("#solar-nuclear-photovoltaic-chart").style("width").replace(/(px)/g, ""));
  d3.select("#solar-nuclear-photovoltaic-chart").call(chart);
}

function drawLineChart() {
  initTime = new Date();

  seedData();
  window.setInterval(updateData, 100);
  d3.select("#solar-nuclear-photovoltaic-chart").datum(lineArr).call(chart);
  d3.select(window).on('resize', resize);
}
 // Function to generate unique IDs
function generateID(num) {
  return "cal" + num;
}

// Function to create and populate the table
function createTable() {
  var tbody = document.getElementById("table-body");
  var count = 1; // To keep track of the calculation ID

  for (var row = 1; row <= 10; row++) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.textContent = row;
      tr.appendChild(td);

      for (var col = 1; col <= 10; col++) {
          var td = document.createElement("td");
          var div = document.createElement("div");
          div.id = generateID(count++);
          div.textContent = "Content";
          td.appendChild(div);
          tr.appendChild(td);
      }

      tbody.appendChild(tr);
  }
}
// Function to create bars




function createBars(data) {

          const getRandomColor = () => {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };

        // Select the SVG using the class name
        const svg = d3.select("#chart-canvas"),
              margin = {top: 40, right: 40, bottom: 40, left: 40},
              width = window.innerWidth - margin.left - margin.right,
              height = 700;

        const x = d3.scaleBand()
                    .domain(d3.range(data.length))
                    .range([margin.left, width - margin.right])
                    .padding(0.1);

        const y = d3.scaleLinear()
                    .domain([0, d3.max(data)])  // domain is based on data values
                    .range([height - margin.bottom, margin.top]);  // range is fixed to chart height

        // Append bars with random colors
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => x(i))
            .attr("y", d => y(d))
            .attr("width", x.bandwidth())
            .attr("height", d => height - margin.bottom - y(d))  // height scales to fit within the fixed chart height
            .attr("fill", () => getRandomColor());  // Assign random color to each bar

        // Append rotated text labels (rotate from the middle of the label)
        svg.selectAll("text")
            .data(data) 
            .enter()
            .append("text")
            .attr("x", (d, i) => x(i) + x.bandwidth() / 2)  // Center the text horizontally
            .attr("y", d => y(d) - 5)  // Position the text slightly above the bar
            .attr("text-anchor", "middle")
            .attr("font-size", "8px")
            .attr("fill", "black")
            .attr("font-size", "5px") 
            .attr("color", "yellow") 
            .attr("transform", (d, i) => {
                const xPosition = x(i) + x.bandwidth() / 2 -12;
                const yPosition = y(d) - 20;
                return `rotate(270, ${xPosition}, ${yPosition})`;  // Rotate around the label's center
            })
            .text(d => d);
  setTimeout(function() { 


}, 10000);
}
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {
    var audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    var microphone = audioContext.createMediaStreamSource(stream);
    
    microphone.connect(analyser);
    
    analyser.fftSize = 32768; 
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength); // Initialize dataArray here
  })
  .catch(function(err) {
    console.error('Error accessing microphone:', err);
  });



navigator.getBattery().then(function(battery) {
  pwrval = battery.level;
 
  battery.addEventListener('levelchange', function() {
    pwrval = battery.level;

  });
}); 


function updateMemoryUsage() {
  if (window.performance && window.performance.memory) {
    var memoryInfo = window.performance.memory;
    zramval = (memoryInfo.usedJSHeapSize/100000000) || 'N/A';

  }
}

// Call the function initially
updateMemoryUsage();

setInterval(updateMemoryUsage, 5000);

// Function to calculate values and update the chart
function ccalc(xval) {

  var cal = [
    xval + fval / zramval / pwrval,
    xval + fval / zramval / pwrval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
    xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval,
      xval + fval
  ];  
//  updatemicdata(cal)


  createBars(cal); // Update the chart with new calculation values
}

// Example usage




navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {  
    var audioContext = new AudioContext();
    var analyser = audioContext.createAnalyser();
    var microphone = audioContext.createMediaStreamSource(stream);
    
    microphone.connect(analyser);
    
    // Set up FFT with a suitable fftSize for 16k resolution
    analyser.fftSize = 32768; // 16k resolution with a sample size of 32k (32768)
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    
    function update() {
      // Get the frequency data
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate the average value
      var sum = dataArray.reduce(function(a, b) { return a + b; }, 0);
      fval = sum / bufferLength;
      
      requestAnimationFrame(update);
    }
    
   update();
  })
  .catch(function(err) {
    console.error('Error accessing microphone:', err);
  });




function manualTranspose(array) {
    const transposed = [];
    const numRows = array.length;
    const numCols = array[0].length;
    
    for (let col = 0; col < numCols; col++) {
        transposed[col] = [];
        for (let row = 0; row < numRows; row++) {
            transposed[col][row] = array[row][col];
         // console.log(array[row][col])
        }
    }
    
    return transposed;
}
document.querySelector('#export100').addEventListener('click', generateChartsAndDownloadPDF);

// Function to generate charts based on the transposed array
function generateChartsAndDownloadPDF() {
  isPrinting = true;
 setTimeout(function(){
html2canvas(document.querySelector("#chart100d"), { scale: 6 }).then(canvas => {
    const imgData = canvas.toDataURL('image/jpeg', 0.8);// Convert canvas to JPEG with 50% quality
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'mm', 'a4', false); // 'l' for landscape, 'a4' size, 'true' for compression
    
    const imgWidth = 297; // A4 landscape width in mm
    const pageHeight = 210; // A4 landscape height in mm
    
    // Calculate image dimensions to fit within the A4 landscape page
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const ratio = Math.min(imgWidth / canvasWidth, pageHeight / canvasHeight); // Calculate the scaling ratio
    
    const imgScaledWidth = canvasWidth * ratio; // Scaled width
    const imgScaledHeight = canvasHeight * ratio; // Scaled height

    // Add the image, scaled to fit within the page
    pdf.addImage(imgData, 'JPEG', 0, 0, imgScaledWidth, imgScaledHeight);

    pdf.save("content_optimized_single_page.pdf"); // Save the generated PDF
});

 },2000)
}

/**Snapshots***/
    const MAX_IMAGES = 19;
    const STORAGE_KEY = 'snapshotGallery';
    const snapshotBtn = document.getElementById('snapshot');
    const captureElement = document.getElementById('video');
    const imageGallery = document.getElementById('imageGallery');

    // Load existing images on page load
    window.onload = loadImages;

    // Handle the snapshot button click
snapshotBtn.addEventListener('click', function() {
  html2canvas(captureElement, { scale: 0.5 }).then(canvas => {  // Reduced scale
    const imageData = canvas.toDataURL('image/jpeg', 0.5);     
    saveSnapshot(imageData);
  });
});


    // Save snapshot and keep only the last 19 images
    function saveSnapshot(imageData) {
      let images = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

      images.push(imageData); // Add new image

      // Keep only the last 19 images
      if (images.length > MAX_IMAGES) {
        images.shift(); // Remove the oldest
      }

      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));

      // Refresh the gallery
      displayImages(images);
    }

    // Load images from localStorage
    function loadImages() {
      const images = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      displayImages(images);
    }

    // Display images in the gallery
    function displayImages(images) {
      imageGallery.innerHTML = ''; // Clear existing images
      images.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.objectFit = 'cover';
        img.style.border = '1px solid #ccc';
        img.style.borderRadius = '5px';
        imageGallery.appendChild(img);
      });
    }

document.querySelector('#showascii').addEventListener('click', showascii);
function showascii(){
var n=pwrval
var i= xMean
var a=fval
var b=zramval
function convertToLaTeX(asciiEquation) {
    // Convert summation notation
    asciiEquation = asciiEquation.replace(/sum_\((.*?)\)\^(.*?) /g, '\\sum_{$1}^{$2} ');
    
    // Convert fractions and parentheses
    asciiEquation = asciiEquation.replace(/\(\((.*?)\)\/(.*?)\)/g, '\\left( \\frac{$1}{$2} \\right)');
    
    // Convert exponents
    asciiEquation = asciiEquation.replace(/\^(.)/g, '^{$1}');
    
    // Return the converted LaTeX equation
    return asciiEquation;
}

nodval;
in$1val;
comGval;
gpuBval;
resWval;
ecmaval;
kworval;
kwROval;
nIDval;
astrval;
posval;
ttokval;
typval;
lBval;
skwsval;
refval;
hoprval;
isarrval;
posival;
celocval;
matcval;
defaval;
parval;
ptacval;
plugval;
ppval;
nexval;
waitval;
init$val;
curval;
empval;
gdval;
lonval;
latval;


// Test conversion
var asciiarray = [ 
`sum_(${gdval}=comGval)^${in$1val} ${b}^${lonval}=(((${latval}(${in$1val}+1))/2))^2`,
`sum_(${n}=parval)^${kworval} ${i}^${n}=(((${kworval}(${kworval}+1))/2))^2`,
`sum_(${gdval}=kwROval)^${ppval} ${n}^${a}=(((${ppval}(${ppval}+parval))/2))^2`,
`sum_(${n}=b)^${astrval} ${b}^${n}=(((${astrval}(${astrval}+plugval))/2))^2`,
`sum_(${a}=in$1val)^${resWval} ${b}^${a}=(((${resWval}(${resWval}+comGval))/2))^2`,
`sum_(${i}=n)^${lBval} ${n}^${b}=(((${lBval}(${lBval}+astrval))/2))^2`,
`sum_(${b}=typval)^${curval} ${a}^${i}=(((${curval}(${curval}+refval))/2))^2`,
`sum_(${a}=astrval)^${defaval} ${b}^${a}=(((${defaval}(${defaval}+kwROval))/2))^2`,
`sum_(${n}=kworval)^${in$1val} ${n}^${b}=(((${in$1val}(${in$1val}+typval))/2))^2`,
`sum_(${a}=plugval)^${typval} ${b}^${a}=(((${typval}(${typval}+curval))/2))^2`,
`sum_(${b}=kwROval)^${defaval} ${a}^${i}=(((${defaval}(${defaval}+lBval))/2))^2`,
`sum_(${i}=parval)^${astrval} ${b}^${a}=(((${astrval}(${astrval}+plugval))/2))^2`,
`sum_(${n}=comGval)^${refval} ${a}^${n}=(((${refval}(${refval}+ppval))/2))^2`,
`sum_(${i}=curval)^${b} ${i}^${a}=(((${b}(${b}+kworval))/2))^2`,
`sum_(${b}=parval)^${typval} ${n}^${b}=(((${typval}(${typval}+lBval))/2))^2`,
`sum_(${n}=plugval)^${astrval} ${i}^${a}=(((${astrval}(${astrval}+ppval))/2))^2`,
`sum_(${i}=astrval)^${b} ${b}^${n}=(((${b}(${b}+refval))/2))^2`,
`sum_(${b}=typval)^${lBval} ${a}^${b}=(((${lBval}(${lBval}+kwROval))/2))^2`,
`sum_(${n}=comGval)^${curval} ${b}^${i}=(((${curval}(${curval}+astrval))/2))^2`,
`sum_(${i}=parval)^${n} ${n}^${b}=(((${n}(${n}+kworval))/2))^2`,
`sum_(${b}=plugval)^${defaval} ${a}^${i}=(((${defaval}(${defaval}+typval))/2))^2`,
`sum_(${i}=ppval)^${curval} ${b}^${n}=(((${curval}(${curval}+astrval))/2))^2`,
`sum_(${a}=lBval)^${b} ${i}^${a}=(((${b}(${b}+kworval))/2))^2`,
`sum_(${n}=refval)^${astrval} ${n}^${b}=(((${astrval}(${astrval}+ppval))/2))^2`,
`sum_(${i}=kwROval)^${refval} ${b}^${a}=(((${refval}(${refval}+curval))/2))^2`,
`sum_(${b}=kworval)^${parval} ${a}^${i}=(((${parval}(${parval}+ppval))/2))^2`,
`sum_(${n}=parval)^${b} ${n}^${b}=(((${b}(${b}+astrval))/2))^2`,
`sum_(${b}=ppval)^${lBval} ${a}^${n}=(((${lBval}(${lBval}+kworval))/2))^2`,
`sum_(${i}=parval)^${curval} ${b}^${a}=(((${curval}(${curval}+refval))/2))^2`,
`sum_(${n}=kwROval)^${astrval} ${i}^${n}=(((${astrval}(${astrval}+typval))/2))^2`,
`sum_(${a}=astrval)^${curval} ${b}^${a}=(((${curval}(${curval}+ppval))/2))^2`,
`sum_(${b}=in$1val)^${typval} ${n}^${b}=(((${typval}(${typval}+kwROval))/2))^2`,
`sum_(${n}=parval)^${lBval} ${a}^${n}=(((${lBval}(${lBval}+curval))/2))^2`,
`sum_(${a}=plugval)^${curval} ${i}^${b}=(((${curval}(${curval}+ppval))/2))^2`,
`sum_(${n}=refval)^${b} ${b}^${i}=(((${b}(${b}+kwROval))/2))^2`,
`sum_(${i}=lBval)^${parval} ${a}^${n}=(((${parval}(${parval}+curval))/2))^2`,
`sum_(${b}=parval)^${kworval} ${b}^${n}=(((${kworval}(${kworval}+typval))/2))^2`,
`sum_(${n}=astrval)^${plugval} ${i}^${b}=(((${plugval}(${plugval}+ppval))/2))^2`,
`sum_(${a}=typval)^${lBval} ${b}^${a}=(((${lBval}(${lBval}+kworval))/2))^2`,
`sum_(${n}=typval)^${curval} ${n}^${b}=(((${curval}(${curval}+plugval))/2))^2`,
`sum_(${b}=kworval)^${lBval} ${a}^${n}=(((${lBval}(${lBval}+refval))/2))^2`,
`sum_(${i}=parval)^${kwROval} ${b}^${n}=(((${kwROval}(${kwROval}+astrval))/2))^2`,
`sum_(${b}=curval)^${kworval} ${i}^${b}=(((${kworval}(${kworval}+typval))/2))^2`,
`sum_(${n}=refval)^${ppval} ${n}^${a}=(((${ppval}(${ppval}+plugval))/2))^2`,
`sum_(${i}=astrval)^${curval} ${b}^${i}=(((${curval}(${curval}+lBval))/2))^2`,
`sum_(${a}=parval)^${typval} ${n}^${a}=(((${typval}(${typval}+refval))/2))^2`,
`sum_(${n}=plugval)^${curval} ${b}^${n}=(((${curval}(${curval}+kwROval))/2))^2`,
`sum_(${i}=ppval)^${astrval} ${a}^${i}=(((${astrval}(${astrval}+plugval))/2))^2`,
`sum_(${b}=typval)^${parval} ${b}^${n}=(((${parval}(${parval}+lBval))/2))^2`,
`sum_(${n}=kwROval)^${refval} ${i}^${a}=(((${refval}(${refval}+typval))/2))^2`,
`sum_(${a}=kworval)^${ppval} ${n}^${b}=(((${ppval}(${ppval}+refval))/2))^2`,
`sum_(${i}=curval)^${lBval} ${b}^${i}=(((${lBval}(${lBval}+plugval))/2))^2`,
`sum_(${b}=plugval)^${typval} ${n}^${b}=(((${typval}(${typval}+kwROval))/2))^2`,
`sum_(${n}=ppval)^${curval} ${a}^${n}=(((${curval}(${curval}+astrval))/2))^2`,
`sum_(${a}=typval)^${lBval} ${i}^${a}=(((${lBval}(${lBval}+refval))/2))^2`,
`sum_(${n}=plugval)^${kwROval} ${b}^${n}=(((${kwROval}(${kwROval}+astrval))/2))^2`,
`sum_(${b}=curval)^${typval} ${n}^${a}=(((${typval}(${typval}+plugval))/2))^2`,
`sum_(${a}=lBval)^${kwROval} ${i}^${a}=(((${kwROval}(${kwROval}+refval))/2))^2`,
`sum_(${i}=ppval)^${astrval} ${n}^${i}=(((${astrval}(${astrval}+plugval))/2))^2`,
`sum_(${b}=typval)^${curval} ${b}^${n}=(((${curval}(${curval}+lBval))/2))^2`,
`sum_(${n}=kwROval)^${parval} ${i}^${b}=(((${parval}(${parval}+refval))/2))^2`,
`sum_(${a}=ppval)^${typval} ${n}^${a}=(((${typval}(${typval}+plugval))/2))^2`,
`sum_(${n}=lBval)^${astrval} ${b}^${n}=(((${astrval}(${astrval}+kwROval))/2))^2`,
`sum_(${b}=plugval)^${typval} ${a}^${b}=(((${typval}(${typval}+curval))/2))^2`,
`sum_(${i}=kwROval)^${refval} ${b}^${n}=(((${refval}(${refval}+plugval))/2))^2`,
`sum_(${a}=astrval)^${curval} ${i}^${a}=(((${curval}(${curval}+refval))/2))^2`,
`sum_(${b}=typval)^${lBval} ${n}^${b}=(((${lBval}(${lBval}+ppval))/2))^2`,
`sum_(${n}=ppval)^${curval} ${a}^${n}=(((${curval}(${curval}+kwROval))/2))^2`,
`sum_(${i}=parval)^${typval} ${b}^${a}=(((${typval}(${typval}+astrval))/2))^2`,
`sum_(${b}=kwROval)^${astrval} ${i}^${b}=(((${astrval}(${astrval}+plugval))/2))^2`,
`sum_(${n}=curval)^${lBval} ${b}^${n}=(((${lBval}(${lBval}+refval))/2))^2`,
`sum_(${a}=typval)^${ppval} ${n}^${b}=(((${ppval}(${ppval}+plugval))/2))^2`,
`sum_(${b}=plugval)^${astrval} ${a}^${i}=(((${astrval}(${astrval}+curval))/2))^2`,
`sum_(${n}=parval)^${lBval} ${b}^${n}=(((${lBval}(${lBval}+typval))/2))^2`,
`sum_(${a}=ppval)^${kwROval} ${i}^${b}=(((${kwROval}(${kwROval}+refval))/2))^2`,
`sum_(${b}=plugval)^${parval} ${n}^${b}=(((${parval}(${parval}+typval))/2))^2`,
`sum_(${n}=curval)^${ppval} ${a}^${n}=(((${ppval}(${ppval}+astrval))/2))^2`,
`sum_(${a}=refval)^${lBval} ${b}^${a}=(((${lBval}(${lBval}+plugval))/2))^2`,
`sum_(${b}=astrval)^${kwROval} ${i}^${b}=(((${kwROval}(${kwROval}+typval))/2))^2`,
`sum_(${n}=parval)^${plugval} ${n}^${a}=(((${plugval}(${plugval}+curval))/2))^2`
];

var asciiarray2 = asciiarray.map(convertToLaTeX);
 console.log(asciiarray)
    var $contentDiv = $('#asciicontent');  // Use jQuery object, not raw DOM element

    // Append each equation as a paragraph
    $.each(asciiarray2, function(index, equation) {
        var p = $('<p></p>').html(`Equation ${index + 1}: \\(${equation}\\)`);
        $contentDiv.append(p);  // Use jQuery's append method
    });

    MathJax.typesetPromise().then(function () {

        // Generate PDF after MathJax renders the LaTeX
        var element = $('#asciicontent')[0];  // Get the DOM element from jQuery

        // Configure margins for the PDF
        var opt = {
            margin:       10,      // 10 units (could be in mm, inches, or px depending on configuration)
            filename:     'equations.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
 
        // Create PDF with configured margins
        html2pdf().set(opt).from(element).save().then(function () {
            console.log("PDF generated with margin");
    //     $('#asciicontent').empty()
        });
    });
} 







function realTimeLineChart() {
  var margin = { top: 20, right: 20, bottom: 50, left: 50 },
    width = 600,
    height = 400,
    duration = 500,
    color = ['#cc1f1f','#FFFF00','#39FF14','#185dd0']; // Red, Yellow, Green ,Blue

  function chart(selection) {
    selection.each(function(data) {
      data = ['x'].map(function(c) {
        return {
          label: c,
          values: data.map(function(d) {
            return { time: +d.time, value: d[c] + zramval + fval + pwrval, signal: +d.signal };
          })
        };
      });

      var t = d3.transition().duration(duration).ease(d3.easeLinear),
        x = d3.scaleTime().rangeRound([0, width - margin.left - margin.right]),
        y = d3.scaleLinear().rangeRound([height - margin.top - margin.bottom, 0]),
        z = d3.scaleOrdinal(color);

      var xMin = d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.time; }) });
      var xMax = new Date(new Date(d3.max(data, function(c) {
        return d3.max(c.values, function(d) { return d.time; })
      })).getTime() - (duration * 2));

      x.domain([xMin, xMax]);
      y.domain([
        d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.value; }) }),
        d3.max(data, function(c) { return d3.max(c.values, function(d) { return d.value; }) })
      ]);
      z.domain(data.map(function(c) { return c.label; }));

      var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.time); })
        .y(function(d) { return y(d.value); });

      var svg = d3.select(this).selectAll("svg").data([data]);
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "axis x");
      gEnter.append("g").attr("class", "axis y");
      gEnter.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom);
      gEnter.append("g")
        .attr("class", "lines")
        .attr("clip-path", "url(#clip)")
        .selectAll(".data").data(data).enter()
        .append("path")
        .attr("class", "data");

      var svg = selection.select("svg");
      svg.attr('width', width).attr('height', height);
      var g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.select("defs clipPath rect")
        .transition(t)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.right);

      g.selectAll("g path.data")
        .data(data)
        .style("stroke-width", 3)
        .style("fill", "none")
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .on("start", tick);

      function tick() {
        var path = d3.select(this)
          .attr("d", function(d) { return line(d.values); })
          .attr("transform", null);

        // Get the current value (height) of the line
        var currentValue = path.data()[0].values.slice(-1)[0].value;

        // Set the color based on the current value
        if (currentValue <= 2) {
          path.style("stroke", color[3]); //blue
        } else if (currentValue <= 5) {
          path.style("stroke", color[2]); // green
        } else if (currentValue <= 8) {
          path.style("stroke", color[1]); // yellow
        } else {
          path.style("stroke", color[0]); // red
        }

        var xMinLess = new Date(new Date(xMin).getTime() - duration);
        d3.active(this)
          .attr("transform", "translate(" + x(xMinLess) + ",0)")
          .transition()
          .on("start", tick);
      }
    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };  

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = _;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  return chart;
}
