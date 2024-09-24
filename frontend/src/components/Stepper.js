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
    const audioRef = useRef(null);
    const videoRef = useRef(null);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = "";
        }
    };

    const resetAudioAndVideo = () => {
        stopAudio();
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            videoRef.current.src = "";
        }
    };

    useEffect(() => {
        const loadAudioUrls = async () => {
            if (steps[currentStep]?.sections) {
                const urls = await Promise.all(
                    steps[currentStep].sections.map(section => fetchTTS(section.audioText))
                );
                setAudioUrls(urls);
                setCurrentSection(0);
            }
        };

        resetAudioAndVideo(); // Stop previous audio and reset video before loading new audio
        loadAudioUrls();
    }, [steps, currentStep]);

    useEffect(() => {
        if (isPlaying && audioUrls[currentSection]?.length) {
            if (audioRef.current) {
                audioRef.current.src = audioUrls[currentSection][0];
                audioRef.current.play().catch(err => console.error("Audio playback failed", err));
                
                // Play video automatically when audio starts
                if (videoRef.current) {
                    videoRef.current.src = steps[currentStep]?.sections[currentSection]?.videoUrl || "";
                    videoRef.current.play().catch(err => console.error("Video playback failed", err));
                }
            }
        }
    }, [isPlaying, currentSection, audioUrls, steps, currentStep]);

    useEffect(() => {
        const handleAudioEnd = () => {
            if (audioRef.current) {
                const nextAudioIndex = audioUrls[currentSection].indexOf(audioRef.current.src) + 1;

                if (nextAudioIndex < audioUrls[currentSection].length) {
                    audioRef.current.src = audioUrls[currentSection][nextAudioIndex];
                    audioRef.current.play();
                } else if (currentSection < steps[currentStep].sections.length - 1) {
                    setCurrentSection(currentSection + 1);
                } else if (currentStep < steps.length - 1) {
                    setCurrentStep(currentStep + 1);
                    setCurrentSection(0);
                    setAudioUrls([]); // Clear previous audio URLs
                } else {
                    setCurrentStep(0);
                    setIsPlaying(false);
                }
            }
        };

        const currentAudioRef = audioRef.current;
        if (currentAudioRef) {
            currentAudioRef.addEventListener('ended', handleAudioEnd);
        }

        return () => {
            if (currentAudioRef) {
                currentAudioRef.removeEventListener('ended', handleAudioEnd);
            }
        };
    }, [audioUrls, currentSection, steps, currentStep]);

    const handleStart = () => {
        setIsPlaying(true);
    };

    const handlePause = () => {
        stopAudio();
        setIsPlaying(false);
    };

    const handleStepClick = (index) => {
        resetAudioAndVideo();
        setCurrentStep(index);
        setCurrentSection(0);
        setIsPlaying(true);
        setAudioUrls([]); // Clear previous audio URLs
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
                    <h1 className='section-title'>
                        {steps[currentStep]?.sections[currentSection]?.section || "No Section Title"}
                    </h1>
                </div>
                <div className="stepper-content">
                    <div className="stepper-text">
                        <p>{steps[currentStep]?.sections[currentSection]?.content || "Content not available for this section."}</p>
                    </div>
                    <div className="stepper-video">
                        {steps[currentStep]?.sections[currentSection]?.videoUrl ? (
                            <video ref={videoRef}/> 
                        ) : (
                            <p>No video available for this section.</p>
                        )}
                        {audioUrls.length > 0 && <audio ref={audioRef} preload="auto" />}
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
