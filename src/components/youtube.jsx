// js
import React from 'react';
import YouTube from 'react-youtube';

function Youtu(id) {

 
    const opts = {
      height: '300.011111111111',
      width: '200.01111111111111111',
      playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
      },
    }
    return (
        <YouTube videoId={id} opts={opts}  />
    )
  }





export default Youtu