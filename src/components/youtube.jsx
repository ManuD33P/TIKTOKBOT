// js
import React, { forwardRef } from 'react';
import YouTube from 'react-youtube';




const Youtu = forwardRef(({ id }, ref,cb) => {
    const opts = {
        height: '300',
        width: '200',
        playerVars: {
            autoplay: 1,
        },
    };

    return <YouTube videoId={id} opts={opts} onStateChange = {(event) => cb(event?.data)} onReady={(event) => {
        ref.current = event.target
        ref.current.setVolume(15)
    }} 
    
    />;
});



export default Youtu;