// Importación de depencias.
import React, { useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import withWidth from '@material-ui/core/withWidth';
import Paper from '@material-ui/core/Paper';
import Collapse from '@material-ui/core/Collapse';
import { getDatabase, ref, set } from "firebase/database";
import { initializeApp } from "firebase/app";

//Inicio de nuestra lógica
function App() {

  //Variables para acceder a la cámara y mostrarla en pantalla.
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  //Variables para colores de la ventana para leer el objeto.
  const useStyles = makeStyles((theme) => ({
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
    objetoDeteccion: {
      margin: "20px"
    }
  }));
  const classes = useStyles();

  //Variables para controlar mostrar y ocultar la ventana y el alert.
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false)
  const [objectRecognition, setObjectRecognition] = useState("")

  //Parametros de conexión al Sonoff.
  const parametrosConexion = {
    apiKey: "AIzaSyBBMZjGC4O0K_5rjhjoNoN_T2RtF5RXVnw",
    authDomain: "homeautomation-b6f3d.firebaseapp.com",
    databaseURL: "https://homeautomation-b6f3d-default-rtdb.firebaseio.com",
    projectId: "homeautomation-b6f3d",
    storageBucket: "homeautomation-b6f3d.appspot.com",
    messagingSenderId: "594989515826",
    appId: "1:594989515826:web:80f6d7c5cb35f2c196e82b",
    measurementId: "G-L0X1CJ0YZY"
  };

  //Cierra la ventana y comienza a reconocer objetos.
  const handleClose = () => {
    setOpen(false);
    runCoco()
  };

  //Establece valores de tamaño para la ventana.
  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  //Ingresa el objeto a detectar.
  const leerObjeto = (e) => {
    setObjectRecognition(e.target.value)
  }

  //Cuerpo de la ventana: mensajes y captura de los valores.
  const body = (
    <div style={modalStyle} className={classes.paper}>
      <Box>
        <h3 id="simple-modal-title">Favor de ingresar el objeto a detectar.</h3>
      </Box>
      <Container maxWidth="fixed">
        <TextField onChange={leerObjeto} id="outlined-basic" variant="outlined" />
      </Container>

      <Container maxWidth="fixed">
        <Button variant="contained" color="primary" onClick={handleClose} >Aceptar</Button>
      </Container>
    </div>
  );

  // Comienza la detección de objetos, pasándole como parámetro
  // lo que se captura con la cámara.
  const runCoco = async () => {
    const net = await cocossd.load();
    setInterval(() => {
      detect(net);
    }, 10);
  };

  // Valida que se tenga conexión con la cámara, manda las imagenes
  // para ser detectados y  llama a la opción de dibujar el rectángulo.
  const detect = async (net) => {

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

  // Dibuja el rectángulo en caso de que se detecte el objeto especificado.
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

      //Se compara que el objeto reconocido sea igual al objeto que le especificamos.
      if (text == objectRecognition) {
        const color = Math.floor(Math.random() * 16777215).toString(16);
        ctx.strokeStyle = '#' + color
        ctx.font = '18px Arial';

        ctx.beginPath();
        ctx.fillStyle = '#' + color
        ctx.fillText(text, x, y);
        ctx.rect(x, y, width, height);
        ctx.stroke();

        //Se muestra el mensaje de que se va a encender el motor. 
        setAlertOpen(true)
      }

      setInterval(() => {
        setAlertOpen(false)
      }, 3000);
    });
  }

  // Método para abrir contactor.
  const abrirContractor = function (e) {
    try {

      const conexion = getDatabase();
      const app = initializeApp(parametrosConexion);
      set(ref(conexion, '/contractor1'), {
        status: 1
      });

    } catch (error) {
      console.error(error);
    }
  }

  // Método para cerrar contactor.
  const cerrarContractor = function (e) {
    try {

      const conexion = getDatabase();
      const app = initializeApp(parametrosConexion);
      set(ref(conexion, '/contractor1'), {
        status: 0
      });

    } catch (error) {
      console.error(error);
    }
  }

  //Dibuja todos los componentes en pantalla.
  return (
    <div className="App">

      <Collapse in={alertOpen}>
        <Alert severity="info">Se detectó camión levantando cortina. </Alert>
      </Collapse>

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
