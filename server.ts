import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import mapRoutes from './routes/mapRoutes';

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.use('/api', mapRoutes);

app.listen(PORT, () => {
    console.log(`✅ Backend TypeScript API siap dan berjalan di http://localhost:${PORT}`);
});