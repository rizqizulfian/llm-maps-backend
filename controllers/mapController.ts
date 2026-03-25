// controllers/mapController.ts

import type { Request, Response } from 'express';
import type { LocationRequestBody, RouteRequestBody, GooglePlace } from '../types/map.types';
import { formatPrice, formatReview, getApiKey, generateStaticMapUrl } from '../utils/mapHelpers';

export const getLocation = async (req: Request<{}, {}, LocationRequestBody>, res: Response): Promise<void> => {
    const { location, place_type } = req.body;

    if (!location || !place_type) {
        res.status(400).json({ error: 'Parameters location and place_type are required.' });
        return;
    }

    try {
        const apiKey = getApiKey();
        const searchQuery = encodeURIComponent(`${place_type} in ${location}`);
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${apiKey}`;

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.status !== 'OK' || !searchData.results?.length) {
            res.json({ success: true, response_for_llm: `Sorry, could not find any ${place_type} in ${location}.` });
            return;
        }

        const top5Places = searchData.results.slice(0, 5);
        const detailedPlaces: GooglePlace[] = await Promise.all(top5Places.map(async (place: { place_id: string }) => {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,user_ratings_total,price_level,opening_hours,reviews,url,geometry&key=${apiKey}`;
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();
            return detailsData.result || place;
        }));

        let markdownResult = `Here are the top 5 recommendations for **${place_type}** in **${location}**:\n\n`;
        let whatsappResult = `Here are the top 5 recommendations for *${place_type}* in *${location}*:\n\n`;

        detailedPlaces.forEach((item, index) => {
            if (index === 0 && item.geometry) {
                const staticMapUrl = generateStaticMapUrl(item, apiKey);
                if (staticMapUrl) {
                    markdownResult += `### 📍 Top Result Map\n\n![Map of ${item.name}](${staticMapUrl})\n\n---\n\n`;
                }
            }

            const ratingText = item.rating ? `${item.rating} ⭐ (${item.user_ratings_total})` : 'No rating yet';
            const priceText = formatPrice(item.price_level);
            const isOpenText = item.opening_hours?.open_now ? '🟢 Open Now' : '🔴 Closed / No info';
            const reviewText = formatReview(item.reviews);

            const mapLink = item.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.formatted_address)}`;
            const dirLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.name)}&destination_place_id=${item.place_id}`;

            markdownResult += `${index + 1}. **${item.name}**\n`;
            markdownResult += `   📊 Rating: ${ratingText} | 💰 ${priceText} | ${isOpenText}\n`;
            markdownResult += `   💬 *" ${reviewText} "*\n`;
            markdownResult += `   📍 [Open Map](${mapLink}) | 🚗 [Get Directions](${dirLink})\n\n`;

            whatsappResult += `${index + 1}. *${item.name}*\n`;
            whatsappResult += `   - Rating: ${ratingText} | Price: ${priceText} | Status: ${isOpenText}\n`;
            whatsappResult += `   - Review: "_${reviewText}_"\n`;
            whatsappResult += `   - Address: ${item.formatted_address}\n`;
            whatsappResult += `   - Map Detail: ${mapLink}\n`;
            whatsappResult += `   - Route & Directions: ${dirLink}\n\n`;
        });

        const waText = encodeURIComponent(whatsappResult).replace(/\*/g, '%2A');
        markdownResult += `\n\n---\n📲 **[Share these recommendations to WhatsApp](https://wa.me/?text=${waText})**`;

        res.json({ success: true, response_for_llm: markdownResult });

    } catch (error) {
        console.error("Error in getLocation:", error);
        res.status(500).json({ error: 'A server error occurred while searching for the location.' });
    }
};

export const getRoute = async (req: Request<{}, {}, RouteRequestBody>, res: Response): Promise<void> => {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
        res.status(400).json({ error: 'Parameters origin and destination are required.' });
        return;
    }

    try {
        const apiKey = getApiKey();
        const routeUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;

        const response = await fetch(routeUrl);
        const data = await response.json();

        if (data.status !== 'OK' || !data.routes?.length) {
            res.json({ success: true, response_for_llm: `Sorry, I could not find a route from ${origin} to ${destination}.` });
            return;
        }

        const leg = data.routes[0].legs[0];
        const navLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

        let markdownResult = `🚗 **Trip Route Information**\n\n`;
        markdownResult += `* **From:** ${leg.start_address}\n`;
        markdownResult += `* **To:** ${leg.end_address}\n`;
        markdownResult += `* **Distance:** ${leg.distance.text}\n`;
        markdownResult += `* **Estimated Time:** ${leg.duration.text} (by car)\n\n`;
        markdownResult += `🔗 [Open Navigation in Google Maps](${navLink})\n`;

        let whatsappResult = `🚗 *Trip Route Information*\n\n`;
        whatsappResult += `* *From:* ${leg.start_address}\n`;
        whatsappResult += `* *To:* ${leg.end_address}\n`;
        whatsappResult += `* *Distance:* ${leg.distance.text}\n`;
        whatsappResult += `* *Estimated Time:* ${leg.duration.text} (by car)\n\n`;
        whatsappResult += `🔗 Navigation Link: ${navLink}\n`;

        const waText = encodeURIComponent(whatsappResult).replace(/\*/g, '%2A');
        markdownResult += `\n---\n📲 **[Share this route to WhatsApp](https://wa.me/?text=${waText})**`;

        res.json({ success: true, response_for_llm: markdownResult });

    } catch (error) {
        console.error("Error in getRoute:", error);
        res.status(500).json({ error: 'A server error occurred while calculating the route.' });
    }
};