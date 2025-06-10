// js
import React, { forwardRef } from 'react';
import YouTube from 'react-youtube';

const Youtu = forwardRef(({ id }, ref) => {
    const opts = {
        height: '300',
        width: '200',
        playerVars: {
            autoplay: 1,
        },
    };

    return <YouTube videoId={id} opts={opts} onReady={(event) => ref.current = event.target} />;
});

export default Youtu;