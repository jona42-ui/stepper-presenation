import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaUserCircle } from 'react-icons/fa'; // Import bell and profile icons
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
                setCurrentSection(0);
            }
        };
        loadAudioUrls();
    }, [steps, currentStep]);

    useEffect(() => {
        if (isPlaying && audioUrls[currentSection]) {
            if (audioRef.current) {
                audioRef.current.src = audioUrls[currentSection];
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
            if (currentSection < audioUrls.length - 1) {
                setCurrentSection(currentSection + 1);
            } else {
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
            <div className="top-bar">
                {/* Treatment title on the left */}
                <div className="treatment-title">
                    <span>{selectedTreatment}</span>
                </div>

                {/* Profile and notification on the right */}
                <div className="profile-notification-container">

                    <div className="notification">
                        <FaBell size={40} color="#007BFF" />
                    </div>
                    {/* Profile section */}
                    <div className="profile">
                        <FaUserCircle size={40} color="#007BFF" />
                        <div className="profile-info">
                            <span className="profile-title">Consenting Doctor</span>
                            <span className="profile-name">Barbra Ndagire B</span>
                        </div>
                    </div>

                    {/* Notification icon */}

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
                        {audioUrls.length > 0 && <audio ref={audioRef} />}
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
