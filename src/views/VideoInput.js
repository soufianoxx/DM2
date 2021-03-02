import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Webcam from 'react-webcam';
import Spraacherkennung from './dicta';
import { loadModels, getFullFaceDescription, createMatcher } from '../api/face';
import axios from 'axios';

// Import face profile
const JSON_PROFILE = require('../descriptors/bnk48.json');

const WIDTH = 650;
const HEIGHT = 650;
const inputSize = 160;
if(!localStorage.getItem('id')){
  const gen=require("uuid/v4");
  localStorage.setItem('id',gen().replaceAll("-",""));
}

const id=localStorage.getItem('id');

class VideoInput extends Component {
  constructor(props) {
    super(props);
    this.webcam = React.createRef();
    this.state = {
      fullDesc: null,
      detections: null,
      descriptors: null,
      faceMatcher: null,
      match: null,
      facingMode: null,
      screenshot: null,
      rightcenter:0,
      topcenter:0,
      bottomcenter:0,
      lefttop:0,
      righttop:0,
      rightbottom:0,
      leftbottom:0,
      middle:0,
      message:"Plase keep 100cm distance",
      statuts:0,
      shouldHide:0,
      leftcenter:0,
      text:"",
    };
   // this.screenshot = this.screenshot.bind(this);
   this.message="Plase keep 100cm distance"

  }
  screenshot(postion) { 
   
     let screenshot = this.webcam.current.getScreenshot();
    this.setState({screenshot: screenshot});
    let data = new FormData();
    data.append('file', screenshot);
    data.append('id', id);
    data.append('position',postion);
    axios.post(`http://www.st-business.com/dm2/gcp_storage.php`,data,{
      headers: {
        'accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.8',
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      }
    })
      .then(res => {
        console.log(res.data);
      })
  }

  sendbackend(){
    if(this.state.text==="OK")
    console.log(this.state.statuts)
    if(this.state.statuts===1){
      this.screenshot("leftcenter");
      this.setState({leftcenter:0})
      this.setState({lefttop:1})
      }
        /* */
        if(this.state.statuts===2){
          this.screenshot("lefttop");
          this.setState({lefttop:0})
          this.setState({topcenter:1})
          }
          /* */
          if(this.state.statuts===3){
            this.screenshot("topcenter");
            this.setState({topcenter:0})
            this.setState({righttop:1})
            }
            /* */
            if(this.state.statuts===4){
              this.screenshot("righttop");
              this.setState({righttop:0})
              this.setState({rightcenter:1})              }
              /* */
              if(this.state.statuts===5){
                this.screenshot("rightcenter");
                this.setState({rightcenter:0})
                this.setState({rightbottom:1})  
                }
                /* */
                if(this.state.statuts===6){
                  this.screenshot("rightbottom");
                  this.setState({rightbottom:0})
                  this.setState({bottomcenter:1})                   }
                  /* */
                  if(this.state.statuts===7){
                    this.screenshot("bottomcenter");
                    this.setState({bottomcenter:0})
                    this.setState({leftbottom:1})  
                    }
                    /* */
                    if(this.state.statuts===8){
                      this.screenshot("leftbottom");
                      this.setState({leftbottom:0})
                      this.setState({middle:1}) 
                      }
                      /* */
                      if(this.state.statuts===9){
                        this.screenshot("middle");
                        this.setState({middle:0}) 
                        }
                        /* */
  }


  SpaachOK(){
 
    this.state.statuts++;// this.setState({statuts: this.state.statuts+1}) 
 // alert("OK")
 if(this.state.statuts==0)
 this.state.text=Spraacherkennung();
 this.sendbackend();
  }

  componentWillMount = async () => {
    await loadModels();
    this.setState({ faceMatcher: await createMatcher(JSON_PROFILE) });
    this.setInputDevice();
  };

  setInputDevice = () => {
    navigator.mediaDevices.enumerateDevices().then(async devices => {
      let inputDevice = await devices.filter(
        device => device.kind === 'videoinput'
      );
      if (inputDevice.length < 2) {
        await this.setState({
          facingMode: 'user'
        });
      } else {
        await this.setState({
          facingMode: { exact: 'environment' }
        });
      }
      this.startCapture();
    });
  };

  startCapture = () => {
    this.interval = setInterval(() => {
      this.capture();
    }, 1500);
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  capture = async () => {
    if (!!this.webcam.current) {
      await getFullFaceDescription(
        this.webcam.current.getScreenshot(),
        inputSize
      ).then(fullDesc => {
        if (!!fullDesc) {
          this.setState({
            detections: fullDesc.map(fd => fd.detection),
            descriptors: fullDesc.map(fd => fd.descriptor)
          });
        }
      });

      if (!!this.state.descriptors && !!this.state.faceMatcher) {
        let match = await this.state.descriptors.map(descriptor =>
          this.state.faceMatcher.findBestMatch(descriptor)
        );
        this.setState({ match });
        //console.log(match);
      }
    }
  };

  render() {
    const { detections, match, facingMode } = this.state;
    let videoConstraints = null;
    if (!!facingMode) {
      videoConstraints = {
        width: WIDTH,
        height: HEIGHT,
        facingMode: facingMode
      };
    }

    let drawBox = null;
    if (!!detections) {
      drawBox = detections.map((detection, i) => {
        let _H = detection.box.height;
        let _W = detection.box.width;
        let _X = detection.box._x;
        let _Y = detection.box._y;
        
       if(!!match && !!match[i] && match[i]._distance>0.78){
        // console.log(match)
        this.message="Please Look at red Point and say ok"
        this.shouldHide=1
       
        if(this.state.statuts===0){
          this.state.leftcenter=1 //
        }
       
        if(this.state.statuts>9)
        this.message="thank you, Mission completed successfully"
       }else{
        this.shouldHide=0
        if(this.state.statuts<9)
        this.message="Please keep 100cm distance"
       }
       
      
       

        return (
         
          <div key={i}>
            
           
            <div
              style={{
                position: 'absolute',
                border: 'solid',
                borderColor: 'blue',
                height: _H,
                width: _W,
                transform: `translate(${_X}px,${_Y}px)`
              }}
            >
        
            </div>
          </div>
        );
      });
    }

    return (
      
     
      <div
        className="Camera"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        
        <div
          style={{
            width: WIDTH,
            height: HEIGHT
          }}
        > 
          <div style={{position:'relative',height: 'inherit'}}>
            <div className={this.shouldHide===0 ? 'hidden' : ''}>
          { this.state.leftcenter>0 ?<span className="punkt" style={{position:'absolute',left:'0px',background:'red',width:'10px',height:'10px',top: '50%'}}></span>: "" }
          { this.state.rightcenter>0 ?<span className="punkt" style={{position:'absolute',right:'0px',background:'red',width:'10px',height:'10px',top: '50%'}}></span>: "" }
          { this.state.topcenter>0 ?<span className="punkt" style={{position:'absolute',top:'0px',background:'red',width:'10px',height:'10px',left: '50%'}}></span>: "" }
          { this.state.bottomcenter>0 ? <span className="punkt" style={{position:'absolute',bottom:'0px',background:'red',width:'10px',height:'10px',right: '50%'}}></span> : "" }
          { this.state.lefttop>0 ?<span className="punkt" style={{position:'absolute',left:'0px',background:'red',width:'10px',height:'10px',top: '0px'}}></span>: "" }
          { this.state.righttop>0 ?<span className="punkt" style={{position:'absolute',right:'0px',background:'red',width:'10px',height:'10px',top: '0px'}}></span>: "" }
          { this.state.rightbottom>0 ?<span className="punkt" style={{position:'absolute',bottom:'0px',background:'red',width:'10px',height:'10px',right: '0px'}}></span>: "" }
          { this.state.leftbottom>0 ? <span className="punkt" style={{position:'absolute',bottom:'0px',background:'red',width:'10px',height:'10px',left: '0px'}}></span> : "" }
          { this.state.middle>0 ? <span className="punkt" style={{position:'absolute',top:'50%',background:'red',width:'10px',height:'10px',left: '50%'}}></span> : "" }
           </div>
           <div style={{ position: 'relative', width: WIDTH }}>
            {!!videoConstraints ? (
              <div style={{ position: 'absolute' }}>
                <Webcam
                  audio={true}
                  width={WIDTH}
                  height={HEIGHT}
                  ref={this.webcam}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                />
              </div>
            ) : null}
            {!!drawBox ? drawBox : null}
          </div>
          </div>
          {this.message}<br/>
<br/>
          <button onClick={this.SpaachOK.bind(this)} className="">Capture</button>
         
        </div>
      </div>
    );
  }
}

export default withRouter(VideoInput);
