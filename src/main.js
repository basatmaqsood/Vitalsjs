document.querySelector('#startCharts').addEventListener('click', onRecord);

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

// draw the signal data as it comes
let lineArr = [];
const MAX_LENGTH = 100;
const DURATION = 100;
let chart = realTimeLineChart();

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
    ccalc(xMean)
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

    document.getElementById('solar-nuclear-photovoltaic-frame-time').innerHTML = `Frame time: ${xMeanData.time.toFixed(2)}`;
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

  var chartContainer = document.getElementById('chart-container');
  chartContainer.innerHTML = ''; // Clear previous bars

  // Loop through data and create bars
  data.forEach(function(value) {
      var bar = document.createElement('div');
      bar.classList.add('bar');
      bar.style.height = value + 'px';
      chartContainer.appendChild(bar);
  });
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



  function createBars(cal) {

    var chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = ''; 
  
    // Loop through data and create bars
    cal.forEach(function(value) {
        var bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = value + 'px';
        chartContainer.appendChild(bar);
    });
}



// Function to calculate values and update the chart
function ccalc(xval) {
  var cal = [
    xval * 4 + fval,
    xval * 5 + fval,
    xval * 6 + fval,
    xval * (45 + 3) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * 4 + fval,
    xval * 5 + fval,
    xval * 6 + fval,
    xval * (45 + 3) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 3) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
    xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 3) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 3) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval,
      xval * ((45 * 8) / 2) + fval
  ];
//  updatemicdata(cal)
  createBars(cal); // Update the chart with new calculation values
}

// Example usage
ccalc(5); // Example call with xval = 5


/*navigator.mediaDevices.getUserMedia({ audio: true })
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
  });*/
            navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {
    // Creating an audio context
    var audioContext = new AudioContext();
    // Creating a media stream source node
    var source = audioContext.createMediaStreamSource(stream);
    // Creating a script processor node to analyze audio data
    var scriptNode = audioContext.createScriptProcessor(2048, 1, 1);
    
    // Connect the source to the scriptNode
    source.connect(scriptNode);
    // Connect the scriptNode to the destination (audio output)
    scriptNode.connect(audioContext.destination);
    
    // Define a function to process audio data
    scriptNode.onaudioprocess = function(audioProcessingEvent) {
      // Get the input buffer (contains audio data)
      var inputBuffer = audioProcessingEvent.inputBuffer;
      // Get the data from the first channel
      var inputData = inputBuffer.getChannelData(0);
      
      // Calculate the volume level
      var volume = 0;
      for (var i = 0; i < inputData.length; i++) {
        volume += Math.abs(inputData[i]);
      }
      volume /= inputData.length;
      fval=volume;
      // Output the volume (you can do whatever you want with it)
      console.log("Volume:", volume);
    };
  })
  .catch(function(err) {
    console.error('Error accessing microphone:', err);
  });
      
    
  

