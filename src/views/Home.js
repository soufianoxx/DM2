import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Home extends Component {
  render() {
    return (
      <div>
      
        
     
          <h2>This application uses artificial intelligence, <br/>and its goal is to collect datatraining 
            to see if a person is looking at the object or not</h2>
          <Link to="/camera" className="button">Start</Link>
      <center><img src="https://www.hwzdigital.ch/files/2015/10/Crowdsourcing-1280x0-c-default.jpg" alt="Crowsourcing" width="800"/></center>
      </div>
    );
  }
}
