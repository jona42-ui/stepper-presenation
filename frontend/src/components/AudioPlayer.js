import React, { useEffect, useRef } from 'react';

const CustomAudioPlayer = ({ audioUrl }) => {
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
        }
    }, [audioUrl]);

    return (
        <div className="audio-player">
            <audio ref={audioRef} controls />
        </div>
    );
};

export default CustomAudioPlayer;
