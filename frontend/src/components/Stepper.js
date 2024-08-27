import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Stepper.css'; 
import { TiTick } from 'react-icons/ti';

const fetchTTS = async (text) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/tts`, { text });
        return `${process.env.REACT_APP_API_URL}${response.data.audioUrl}`;
        
    } catch (error) {
        console.error("Error fetching TTS audio:", error);
        return null;
    }

};

const Stepper = ({ steps }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [currentSection, setCurrentSection] = useState(0);
    const [audioUrls, setAudioUrls] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        // Load audio URLs for the current step's sections
        const loadAudioUrls = async () => {
            if (steps[currentStep]?.sections) {
                const urls = await Promise.all(
                    steps[currentStep].sections.map(section => fetchTTS(section.audioText))
                );
                console.log(urls);
                setAudioUrls(urls);
                setCurrentSection(0); // Reset section to the first one
            }
        };
        

        loadAudioUrls();
    }, [steps, currentStep]);

    useEffect(() => {
        // Play audio for the current section
        if (isPlaying && audioUrls[currentSection]) {
            if (audioRef.current) {
                audioRef.current.src = audioUrls[currentSection];
                audioRef.current.play();
            }
        }
    }, [isPlaying, currentSection, audioUrls]);

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

        return currentStep;
    };

    const handleNext = () => {
        if (currentSection < steps[currentStep].sections.length - 1) {
            // Move to the next section within the current step
            setCurrentSection(currentSection + 1);
        } else {
            // Check if there are more steps available
            const nextStep = findNextStepIndex('next');
            
            if (nextStep === currentStep) {
                // If nextStep is the same as currentStep, it means there are no more steps to move to
                console.log("You are already at the last step.");
                return; // Prevent moving further
            }
            
            // Move to the next step and reset section index
            setCurrentStep(nextStep);
            setCurrentSection(0);
        }
    };

    const handlePrevious = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        } else {
            // Move to the previous step and reset section index
            const prevStep = findNextStepIndex('previous');
            setCurrentStep(prevStep);
            setCurrentSection(0);
        }
    };

    const handleStart = () => {
        if (videoRef.current) {
            videoRef.current.play();
        }
        setIsPlaying(true);
    };

    const handlePause = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        setIsPlaying(false);
    };

    useEffect(() => {
        const handleAudioEnd = () => {
            if (currentSection < audioUrls.length - 1) {
                setCurrentSection(currentSection + 1); // Move to the next section
            } else {
                // All sections of the current step are done
                handleNext(); // Proceed to the next step
                setIsPlaying(false); 
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
    }, [currentSection, audioUrls.length]);

    return (
        <div className="stepper-container">
            <div className="progress-bar">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`step-item ${currentStep === index ? "active" : ""} ${index < currentStep ? "complete" : ""}`}
                    >
                        <div className="step">
                            {index < currentStep ? <TiTick size={24} /> : index + 1}
                        </div>
                        <p>{step.title}</p>
                    </div>
                ))}
            </div>
            <div className="stepper-content">
                <div className="stepper-text">
                    <h1>{steps[currentStep]?.sections[currentSection]?.section}</h1>
                    <p>{steps[currentStep]?.sections[currentSection]?.content}</p>
                </div>
                <div className="stepper-video">
                    <video ref={videoRef} src={steps[currentStep]?.sections[currentSection]?.videoUrl} />
                    {audioUrls.length > 0 && <audio ref={audioRef} />}
                </div>
            </div>
            <div className="controls">
                <button onClick={handlePrevious}>Previous</button>
                {isPlaying ? (
                    <button onClick={handlePause}>Pause</button>
                ) : (
                    <button onClick={handleStart}>Start</button>
                )}
                <button onClick={handleNext}>Next</button>
            </div>
        </div>
    );
};

export default Stepper;
