/* global webgazer */  // Declare webgazer as a global variable

import React, { useEffect, useState, useRef } from 'react';
import * as blazeface from '@tensorflow-models/blazeface'; // Import BlazeFace for face detection
import '@tensorflow/tfjs'; // Ensure TensorFlow.js is available

const ProctoringComponent = ({ onSuspiciousActivity }) => {
  const [gazeAway, setGazeAway] = useState(false);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Dynamically load the WebGazer script
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/webgazer@2.1.0/dist/webgazer.min.js";
    script.async = true;
    script.onload = () => {
      console.log('WebGazer loaded');

      // Initialize WebGazer for gaze tracking
      webgazer.setGazeListener((data) => {
        if (data == null) {
          return;
        }

        const { x, y } = data;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Check if gaze is outside the central screen area
        const isLookingAway = x < screenWidth * 0.2 || x > screenWidth * 0.8 || y < screenHeight * 0.2 || y > screenHeight * 0.8;

        if (isLookingAway) {
          if (!gazeAway) {
            setGazeAway(true);
            onSuspiciousActivity(true); // Notify parent about suspicious activity
          }
        } else {
          if (gazeAway) {
            setGazeAway(false);
            onSuspiciousActivity(false); // Gaze restored, stop flagging suspicious activity
          }
        }
      }).begin();

      // Initialize the webcam stream for face detection
      initWebcam();
    };

    // Append the script to the document head
    document.head.appendChild(script);

    // Initialize webcam stream for face detection
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Load BlazeFace model
        const faceModel = await blazeface.load();
        detectFaces(faceModel);
      } catch (err) {
        console.error('Error accessing webcam', err);
      }
    };

    // Detect faces and check for multiple faces
    const detectFaces = async (faceModel) => {
      setInterval(async () => {
        if (videoRef.current) {
          const predictions = await faceModel.estimateFaces(videoRef.current, false);

          if (predictions.length > 1) {
            setMultipleFacesDetected(true);
            onSuspiciousActivity(true); // Flag multiple faces as suspicious
          } else {
            setMultipleFacesDetected(false);
            if (!gazeAway) {
              onSuspiciousActivity(false); // No suspicious activity if gaze is restored and no multiple faces
            }
          }
        }
      }, 1000); // Check every second
    };

    // Cleanup function to stop WebGazer and the webcam when the component unmounts
    return () => {
      if (window.webgazer) {
        webgazer.pause(); // Pause WebGazer when component unmounts
      }
    };
  }, [gazeAway, onSuspiciousActivity]);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, width: '200px', height: '150px', backgroundColor: 'white', border: '1px solid black', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', borderRadius: '10px' }}>
      {/* WebGazer video feed */}
      <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%', borderRadius: '10px' }} />

      {/* Suspicious activity warning for multiple faces */}
      {multipleFacesDetected && (
        <p style={{ color: 'red', fontSize: '10px' }}>Suspicious Activity: Multiple Faces Detected!</p>
      )}
    </div>
  );
};

export default ProctoringComponent;
