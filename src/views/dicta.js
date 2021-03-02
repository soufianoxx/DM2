import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const Dictaphone = () => {
    const [result, setResult] = useState('');
    const commands = [
        {
          command: 'reset',
          callback: () => resetTranscript()
        },        
        {
          command: 'ok',
          callback: () => setResult(' you just said ok ') 
        }
      ]
  const { transcript, interimTranscript, finalTranscript,resetTranscript,listening} = useSpeechRecognition({ commands })


    useEffect(() => {
        if (finalTranscript !== '') {
         console.log('here is your result:', finalTranscript);
        }}, [interimTranscript, finalTranscript]);
        if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
            console.log("this browser doesn't support speech recognition !")
            }
            if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
            return null;
            }
        
const listenContinuously = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: 'en-GB',
    });
  };



  return (
    <div>

     <span> voice : {listening ? 'turned on' : 'turned off'} </span>
      <button onClick={listenContinuously}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>
      <br/>
      <p> here is the result : {result}</p>

    </div>
  )
}
export default Dictaphone;