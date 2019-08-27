const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');

let net;

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

async function app() {
  console.log('Loading mobilenet..');

  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  const addExample = classId => {
    const activation = net.infer(webcamElement, 'conv_preds');
    classifier.addExample(activation, classId);
  };

  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  document.getElementById('class-nothing').addEventListener('click', () => addExample(3));

  while (true) {
    if (classifier.getNumClasses() > 0) {

      const activation = net.infer(webcamElement, 'conv_preds');
      const result = await classifier.predictClass(activation);

      const classes = ['A', 'B', 'C', 'No'];
      document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
    }

    await tf.nextFrame();
  }
}

app();
