import express from 'express';
import googleTTS from 'google-tts-api';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const AUDIO_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname).substring(1), 'temp_audio');

// Ensure AUDIO_DIR exists
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

const saveAudioFile = async (url, fileName) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio from URL: ${url}. Status: ${response.status}`);
        }

        const filePath = path.join(AUDIO_DIR, fileName);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);

        console.log(`Saved audio file: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Error saving audio file:', error);
        throw error;
    }
};

router.post('/', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('No text provided.');
    }

    try {
        const audioUrls = googleTTS.getAllAudioUrls(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
            splitPunct: ',.?!' 
        });

        const audioFiles = [];
        for (const [index, audioUrl] of audioUrls.entries()) {
            const fileName = `audio_chunk_${Date.now()}_${index}.mp3`;
            const filePath = await saveAudioFile(audioUrl.url, fileName);
            audioFiles.push(`/api/tts/audio/${fileName}`);
        }

        res.json({ audioUrls: audioFiles });
    } catch (error) {
        console.error('Error generating audio:', error);
        res.status(500).send('Error generating audio');
    }
});

// Serve static audio files
router.use('/audio', express.static(AUDIO_DIR, {
    setHeaders: (res) => {
        res.setHeader('Content-Type', 'audio/mpeg');
    }
}));

export default router;
