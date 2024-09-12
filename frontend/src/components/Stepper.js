import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaUserCircle } from 'react-icons/fa'; 
import './Stepper.css';
import { TiTick } from 'react-icons/ti';

const fetchTTS = async (text) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/tts`, { text });
        console.log('API Response:', response.data);

        const audioUrls = response.data.audioUrls;
        if (!audioUrls || audioUrls.length === 0) {
            throw new Error("audioUrls is undefined or empty");
        }

        // Return the complete URLs, ensuring they are separate
        return audioUrls.map(url => `${process.env.REACT_APP_API_URL}${url}`);
    } catch (error) {
        console.error("Error fetching TTS audio:", error);
        return [];
    }
};

const Stepper = ({ steps, selectedTreatment }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [currentSection, setCurrentSection] = useState(0);
    const [audioUrls, setAudioUrls] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    // Function to stop audio
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = ""; // Clear audio source to avoid overlap
        }
    };

    // Load audio URLs for the current step's sections
    useEffect(() => {
        const loadAudioUrls = async () => {
            if (steps[currentStep]?.sections) {
                const urls = await Promise.all(
                    steps[currentStep].sections.map(section => fetchTTS(section.audioText))
                );
                setAudioUrls(urls);
                setCurrentSection(0); // Start from the first section
            }
        };
        stopAudio(); // Stop previous step's audio before loading new audio
        loadAudioUrls();
    }, [steps, currentStep]);

    // Play audio sequentially for each section
    useEffect(() => {
        if (isPlaying && audioUrls[currentSection]) {
            if (audioRef.current) {
                audioRef.current.src = audioUrls[currentSection][0]; // Play first URL of the current section
                audioRef.current.play().catch(err => console.error("Audio playback failed", err));
            }
        }
    }, [isPlaying, currentSection, audioUrls]);

    // Handle audio end event to move to the next section or step
    useEffect(() => {
        const handleAudioEnd = async () => {
            if (audioRef.current) {
                const nextAudioIndex = audioUrls[currentSection].indexOf(audioRef.current.src) + 1;

                if (nextAudioIndex < audioUrls[currentSection].length) {
                    // Play the next audio URL in the current section
                    audioRef.current.src = audioUrls[currentSection][nextAudioIndex];
                    audioRef.current.play();
                } else if (currentSection < steps[currentStep].sections.length - 1) {
                    // Move to the next section
                    setCurrentSection(currentSection + 1);
                } else if (currentStep < steps.length - 1) {
                    // Move to the next step
                    setCurrentStep(currentStep + 1);
                    setCurrentSection(0);
                } else {
                    // End of steps, stop playback
                    setCurrentStep(0);
                    setIsPlaying(false);
                }
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
    }, [audioUrls, currentSection, steps, currentStep]);

    // Handle the start of the process
    const handleStart = () => {
        setIsPlaying(true);
    };

    // Handle pause
    const handlePause = () => {
        stopAudio();
        setIsPlaying(false);
    };

    // Handle step click to manually change step
const handleStepClick = (index) => {
    stopAudio(); // Stop current audio before changing step

    if (steps[index] && steps[index].sections.length > 0) {
        // If the step has sections, reset the step and start playback
        setCurrentStep(index);
        setCurrentSection(0);
        setIsPlaying(true);
    } else {
        // Check if there are more sections in the current step
        if (currentSection < steps[currentStep].sections.length - 1) {
            setCurrentSection(currentSection + 1); // Move to next section
        } else if (currentStep < steps.length - 1) {
            // If all sections are done, move to the next step
            setCurrentStep(currentStep + 1);
            setCurrentSection(0);
        } else {
            // If it's the last step, reset to the first step and stop playback
            setCurrentStep(0);
            setCurrentSection(0);
            setIsPlaying(false);
        }
    }
};



    // Load video URL for the current section
    useEffect(() => {
        if (videoRef.current && steps[currentStep]?.sections[currentSection]?.videoUrl) {
            videoRef.current.src = steps[currentStep].sections[currentSection].videoUrl;
            videoRef.current.load();
        }
    }, [currentStep, currentSection, steps]);

    return (
        <div className="stepper-container">
            <div className="top-bar">
                <div className="treatment-title">
                    <span>{selectedTreatment}</span>
                </div>
                <div className="profile-notification-container">
                    <div className="notification">
                        <FaBell size={40} color="#007BFF" />
                    </div>
                    <div className="profile">
                        <FaUserCircle size={40} color="#007BFF" />
                        <div className="profile-info">
                            <span className="profile-title">Consenting Doctor</span>
                            <span className="profile-name">Barbra Ndagire B</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="progress-bar">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`step-item ${currentStep === index ? "active" : ""}`}
                        onClick={() => handleStepClick(index)}
                    >
                        <div className="step">
                            {index === currentStep ? index + 1 : (index < currentStep ? <TiTick size={24} /> : index + 1)}
                        </div>
                        <span className="step-title">{step.title}</span>
                    </div>
                ))}
            </div>

            <div className="controls">
                {isPlaying ? (
                    <button onClick={handlePause}>Pause</button>
                ) : (
                    <button onClick={handleStart}>Start</button>
                )}
            </div>

            <div className='card'>
                <div className='section-title'>
                    <h1 className='section-title'>{steps[currentStep]?.sections[currentSection]?.section}</h1>
                </div>
                <div className="stepper-content">
                    <div className="stepper-text">
                        <p>{steps[currentStep]?.sections[currentSection]?.content}</p>
                    </div>
                    <div className="stepper-video">
                        <video ref={videoRef} src={steps[currentStep]?.sections[currentSection]?.videoUrl} />
                        {audioUrls.length > 0 && <audio ref={audioRef} preload="auto"/>}
                    </div>
                </div>
                <div className="section-progress">
                    {`${currentSection + 1} of ${steps[currentStep]?.sections.length}`}
                </div>
            </div>
        </div>
    );
};

export default Stepper;
