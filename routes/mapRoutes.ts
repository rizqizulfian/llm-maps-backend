import { Router } from 'express';
import { getLocation, getRoute } from '../controllers/mapController';

const router = Router();

// Definisikan jalur endpoint-nya
router.post('/get-location', getLocation);
router.post('/get-route', getRoute);

export default router;