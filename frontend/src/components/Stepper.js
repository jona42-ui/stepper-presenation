import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Stepper.css';  

const fetchTTS = async (text) => {
    try {
        const response = await axios.post('http://localhost:3001/api/tts', { text });
        return `http://localhost:3001${response.data.audioUrl}`;
    } catch (error) {
        console.error("Error fetching TTS audio:", error);
        return null;
    }
};

const Stepper = ({ steps }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [introSteps, setIntroSteps] = useState([]);
    const [audioUrls, setAudioUrls] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioIndex, setAudioIndex] = useState(0);
    const [displayContent, setDisplayContent] = useState('');
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        // Filter "Introduction" steps and load their audio URLs
        const loadIntroSteps = async () => {
            const filteredSteps = steps.filter(step => step.title === 'Introduction');
            const urls = await Promise.all(filteredSteps.map(step => fetchTTS(step.audioText)));
            setIntroSteps(filteredSteps);
            setAudioUrls(urls);
        };

        loadIntroSteps();
    }, [steps]);

    useEffect(() => {
        // Update display content based on the current audio index
        if (introSteps[audioIndex]) {
            setDisplayContent(introSteps[audioIndex].content);
        }
    }, [audioIndex, introSteps]);

    useEffect(() => {
        // Update display content based on the current step
        if (steps[currentStep]) {
            setDisplayContent(steps[currentStep].content);
        }
    }, [currentStep, steps]);

    useEffect(() => {
        // Play audio sequentially
        if (isPlaying && audioUrls.length > 0 && audioIndex < audioUrls.length) {
            if (audioRef.current) {
                audioRef.current.src = audioUrls[audioIndex];
                audioRef.current.play();
            }
        }
    }, [isPlaying, audioIndex, audioUrls]);

    const findNextStepIndex = (direction) => {
        const currentTitle = steps[currentStep]?.title;
        let newIndex = currentStep;

        while (true) {
            if (direction === 'next') {
                newIndex = (newIndex + 1) % steps.length;
            } else if (direction === 'previous') {
                newIndex = (newIndex - 1 + steps.length) % steps.length;
            }

            if (steps[newIndex]?.title !== currentTitle) {
                return newIndex;
            }

            // Break the loop if we've cycled through all steps with the same title
            if (newIndex === currentStep) {
                break;
            }
        }

        // If no different title found, return the current index
        return currentStep;
    };

    const handleNext = () => {
        setCurrentStep(findNextStepIndex('next'));
    };

    const handlePrevious = () => {
        setCurrentStep(findNextStepIndex('previous'));
    };


    const handleStart = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
        setIsPlaying(true);
    };

    useEffect(() => {
        const handleAudioEnd = () => {
            if (audioIndex < audioUrls.length - 1) {
                setAudioIndex(prevIndex => prevIndex + 1); // Move to the next audio URL
            } else {
                setIsPlaying(false); // Stop playing when all are finished
                setAudioIndex(0); // Reset audio index
            }
        };

        if (audioRef.current) {
            audioRef.current.addEventListener('ended', handleAudioEnd);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleAudioEnd);
            }
        };
    }, [audioIndex, audioUrls.length]);

    return (
        <div className="stepper-container">
            <div className="stepper-content">
                <div className="stepper-text">
                    <h2>{steps[currentStep]?.title}</h2>
                    <p>{displayContent}</p>
                </div>
                <div className="stepper-video">
                    <video ref={videoRef} src={steps[currentStep]?.videoUrl} />
                    {audioUrls.length > 0 && <audio ref={audioRef} />}
                </div>
            </div>
            <div className="controls">
                <button onClick={handlePrevious}>Previous</button>
                <button onClick={handleStart} disabled={isPlaying}>Start</button>
                <button onClick={handleNext}>Next</button>
            </div>
        </div>
    );
};

export default Stepper;
