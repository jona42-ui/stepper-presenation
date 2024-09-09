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
        loadAudioUrls();
    }, [steps, currentStep]);

    useEffect(() => {
        if (isPlaying && audioUrls[currentSection]) {
            if (audioRef.current) {
                audioRef.current.src = audioUrls[currentSection][0]; // Start with the first URL
                audioRef.current.play();
            }
        }
    }, [isPlaying, currentSection, audioUrls]);
    
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
            if (audioRef.current) {
                // Move to the next audio URL within the current section
                const nextAudioIndex = audioUrls[currentSection].indexOf(audioRef.current.src) + 1;
                
                if (nextAudioIndex < audioUrls[currentSection].length) {
                    // Play the next URL in the current section
                    audioRef.current.src = audioUrls[currentSection][nextAudioIndex];
                    audioRef.current.play();
                } else if (currentSection < steps[currentStep].sections.length - 1) {
                    // Move to the next section if all audio in the current section is played
                    setCurrentSection(currentSection + 1);
                } else if (currentStep < steps.length - 1) {
                    // Move to the next step if all sections in the current step are played
                    setCurrentStep(currentStep + 1);
                    setCurrentSection(0); // Start the new step from the first section
                } else {
                    // Reset to the first step and section if all steps are played
                    setCurrentStep(0);
                    setCurrentSection(0);
                    setIsPlaying(false); // Stop playing
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
    }, [currentStep, currentSection, steps, audioUrls]);

    useEffect(() => {
        if (videoRef.current && steps[currentStep]?.sections[currentSection]?.videoUrl) {
            videoRef.current.src = steps[currentStep].sections[currentSection].videoUrl;
            videoRef.current.load();
        }
    }, [currentStep, currentSection, steps]);
    
    useEffect(() => {
        if (audioRef.current && audioUrls[currentSection]) {
            audioRef.current.src = audioUrls[currentSection];
            audioRef.current.load();
            audioRef.current.play().catch(error => {
                console.error("Error playing audio:", error);
            });
        }
    }, [audioUrls, currentSection]);

    const handlePlayAudio = () => {
        if (audioRef.current && audioUrls[currentSection]) {
            audioRef.current.src = audioUrls[currentSection][0]; // Load the first URL
            audioRef.current.play()
                .then(() => {
                    console.log("Audio is playing.");
                })
                .catch(error => {
                    console.error("Error playing audio:", error);
                    // Retry mechanism
                    setTimeout(() => {
                        audioRef.current.play().catch(err => {
                            console.error("Retry failed:", err);
                        });
                    }, 1000);
                });
        }
    };
    

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
                        className={`step-item ${currentStep === index ? "active" : ""} ${index < currentStep ? "complete" : ""}`}
                    >
                        <div className="step">
                            {index < currentStep ? <TiTick size={24} /> : index + 1}
                        </div>
                        <span className="step-title">{step.title}</span>
                    </div>
                ))}
            </div>

            <div className="controls">
                {isPlaying ? (
                    <button onClick={handlePause}>Pause</button>
                ) : (
                    <button onClick={handlePlayAudio}>Start</button>
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
