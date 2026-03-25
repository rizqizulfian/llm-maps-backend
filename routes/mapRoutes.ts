import { Router } from 'express';
import {
    getRoute,
    chatWithAI,
    getLocation,
} from '../controllers/mapController';

const router = Router();

router.post('/get-location', getLocation);
router.post('/get-route', getRoute);
router.post('/chat', chatWithAI);

export default router;