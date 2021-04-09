import { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";

function App() {
  const [model, setModel] = useState();

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [webcamLoad, setWebcamLoad] = useState(false);

  const [videoWidth, setVideoWidth] = useState(640);
  const [videoHeight, setVideoHeight] = useState(360);

  const videoConstraints = {
    height: videoHeight,
    width: videoWidth,
    maxWidth: "100vw",
    facingMode: "environment",
  };

  const loadModel = async () => {
    try {
      const model = await cocoSsd.load();
      setModel(model);
      console.log("Successfully loaded model");
    } catch (err) {
      console.log(err);
      console.log("Failed to load model");
    }
  };

  const prediction = async () => {
    const image = webcamRef.current.video;
    const predictions = await model.detect(image);
    // console.log(predictions);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (predictions.length > 0) {
      for (let n = 0; n < predictions.length; n++) {
        if (predictions[n].score > 0.4) {
          const bboxLeft = predictions[n].bbox[0];
          const bboxTop = predictions[n].bbox[1];
          const bboxWidth = predictions[n].bbox[2];
          const bboxHeight = predictions[n].bbox[3] - bboxTop;

          ctx.beginPath();
          ctx.font = "14px Arial";
          ctx.fillStyle = "red";

          ctx.fillText(
            predictions[n].class +
              ": " +
              Math.round(parseFloat(predictions[n].score) * 100) +
              "%",
            bboxLeft + 10,
            bboxTop + 20
          );

          ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
          ctx.strokeStyle = "#89ee26";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    setTimeout(() => prediction(), 10);
  };

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  return (
    <div className="App">
      <h1>Object Detection (coco-ssd)</h1>
      <div>
        <div style={{ position: "absolute", top: "130px", zIndex: "2" }}>
          <canvas
            ref={canvasRef}
            width={videoWidth}
            height={videoHeight}
            style={{ backgroundColor: "transparent" }}
          />
        </div>
        <div style={{ position: "absolute", top: "130px", zIndex: "1" }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            width={videoWidth}
            height={videoHeight}
            screenshotQuality={1}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={() => {
              setWebcamLoad(true);
            }}
          />
        </div>
        <button onClick={prediction} disabled={!webcamLoad}>
          Start
        </button>
      </div>
    </div>
  );
}

export default App;
