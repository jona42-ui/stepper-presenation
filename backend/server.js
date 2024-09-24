
import express from 'express';
import cors from 'cors';
import ttsRoutes from './routes/tts.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tts', ttsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
