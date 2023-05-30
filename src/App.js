// Import dependencies
import React, { useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import env from "react-dotenv";
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const useStyles = makeStyles((theme) => ({
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }));
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function rand() {
    return Math.round(Math.random() * 20) - 10;
  }

  function getModalStyle() {
    const top = 50 + rand();
    const left = 50 + rand();

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <h2 id="simple-modal-title">Detección de unidad.</h2>
      <p id="simple-modal-description">
        Se detectó un camión.
      </p>
      {/* <SimpleModal /> */}
    </div>
  );

  // Main function
  const runCoco = async () => {
    const net = await cocossd.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const obj = await net.detect(video);

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
    }
  };

  const drawRect = (detections, ctx) => {
    // Loop through each prediction
    detections.forEach(prediction => {

      // Extract boxes and classes
      const [x, y, width, height] = prediction['bbox'];
      const text = prediction['class'];

      const color = Math.floor(Math.random() * 16777215).toString(16);
      ctx.strokeStyle = '#' + color
      ctx.font = '18px Arial';

      // Draw rectangles and text
      ctx.beginPath();
      ctx.fillStyle = '#' + color
      ctx.fillText(text, x, y);
      ctx.rect(x, y, width, height);
      ctx.stroke();

      console.log("Text: ", text);

      if (text == env.OBJECT_DETECTION) {
        //alert("Se detectó una persona.")
        // Set styling
        const color = Math.floor(Math.random() * 16777215).toString(16);
        ctx.strokeStyle = '#' + color
        ctx.font = '18px Arial';

        // Draw rectangles and text
        ctx.beginPath();
        ctx.fillStyle = '#' + color
        ctx.fillText(text, x, y);
        ctx.rect(x, y, width, height);
        ctx.stroke();
        setOpen(true)
      }
    });
  }

  useEffect(() => {
    runCoco()
  }, []);

  // const prender = function (e) {
  //   try {

  //     const firebaseConfig = {
  //       apiKey: "AIzaSyBBMZjGC4O0K_5rjhjoNoN_T2RtF5RXVnw",
  //       authDomain: "homeautomation-b6f3d.firebaseapp.com",
  //       databaseURL: "https://homeautomation-b6f3d-default-rtdb.firebaseio.com",
  //       projectId: "homeautomation-b6f3d",
  //       storageBucket: "homeautomation-b6f3d.appspot.com",
  //       messagingSenderId: "594989515826",
  //       appId: "1:594989515826:web:80f6d7c5cb35f2c196e82b",
  //       measurementId: "G-L0X1CJ0YZY"
  //     };

  //     // Initialize Firebase
  //     const app = initializeApp(firebaseConfig);

  //     const db = getDatabase();
  //     set(ref(db, '/led1'), {
  //       status: 1
  //     });

  //     console.log("😁 Setted.");


  //   } catch (error) {
  //     console.error("🙈 Error: ", error);
  //   }
  // }

  // useEffect(() => {
  // (async () => {
  //   try {

  //     const connection = new ewelink({
  //       email: "juanpadillavapi@gmail.com",
  //       password: "sonoffR2",
  //     });

  //     // const connection = new ewelink({
  //     //   email: "tugsbayar.g@gmail.com",
  //     //   password: "mdk06tgs6",
  //     //   region: "as"
  //     // });

  //     const region = await connection.getRegion();

  //     // console.log('access token: ', region.at);
  //     // console.log('api key: ', region.user.apikey);
  //     // console.log('region: ', region.region);

  //     console.log("😁 Created");

  //     /* get all devices */
  //     // const devices = await connection.getDevices();

  //     /* get specific devide info */
  //     // const device = await connection.getDevice('<your device id>');
  //     // console.log(device);

  //     // /* toggle device */
  //     // await connection.toggleDevice('<your device id>');

  //   } catch (error) {
  //     console.error("error", error);
  //   }
  // })();
  // })

  return (
    <div className="App">
      {/* <button onClick={prender}>Prender</button> */}
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />


      </header>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}

export default App;
