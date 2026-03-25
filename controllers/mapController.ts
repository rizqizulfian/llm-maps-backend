import type { Request, Response } from 'express';
import type { LocationRequestBody, RouteRequestBody, GooglePlace } from '../types/map.types';
import { formatPrice, formatReview, getApiKey, generateStaticMapUrl, generateEmbedMapIframe } from '../utils/mapHelpers';

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
            if (index === 0) {
                markdownResult += `### 📍 Top Result Maps\n\n`;

                if (item.geometry) {
                    const staticMapUrl = generateStaticMapUrl(item, apiKey);
                    if (staticMapUrl) {
                        markdownResult += `**Static Map Preview:**\n![Map of ${item.name}](${staticMapUrl})\n\n`;
                    }
                }

                const iframeHtml = generateEmbedMapIframe(item, apiKey);
                markdownResult += `**Interactive Map:**\n${iframeHtml}\n\n---\n\n`;
            }

            const ratingText = item.rating ? `${item.rating} ⭐ (${item.user_ratings_total})` : 'No rating yet';
            const priceText = formatPrice(item.price_level);
            const isOpenText = item.opening_hours?.open_now ? '🟢 Open Now' : '🔴 Closed / No info';
            const reviewText = formatReview(item.reviews);

            const mapLink = item.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.formatted_address)}`;
            const dirLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.name)}&destination_place_id=${item.place_id}`;

            markdownResult += `**${index + 1}. ${item.name}**\n`;
            markdownResult += `📊 Rating: ${ratingText} | 💰 ${priceText} | ${isOpenText}\n`;
            markdownResult += `💬 _" ${reviewText} "_\n`;
            markdownResult += `📍 [Open Map](${mapLink}) | 🚗 [Get Directions](${dirLink})\n\n---\n\n`;

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

export const chatWithAI = async (req: Request, res: Response): Promise<void> => {
    const { prompt } = req.body;

    if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
    }

    try {
        const ollamaRes = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.1',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful and intelligent AI assistant. 
                        RULE 1: If the user asks for places, restaurants, cafes, locations, or directions, you MUST use the 'search_google_maps' tool.
                        RULE 2: If the user asks a general question (e.g., science, coding, casual chat, "why is the sky blue"), you MUST NOT use the tool. Simply answer the question conversationally in Markdown format. DO NOT output any JSON if you are answering conversationally.`
                    },
                    { role: 'user', content: prompt }
                ],
                stream: false,
                tools: [{
                    type: "function",
                    function: {
                        name: "search_google_maps",
                        description: "Search for places or locations on Google Maps.",
                        parameters: {
                            type: "object",
                            properties: {
                                place_type: {
                                    type: "string",
                                    description: "The EXACT specific place, food, or activity requested (e.g., 'seafood', 'nasi padang')."
                                },
                                location: {
                                    type: "string",
                                    description: "The city or area. Default is 'Batam' if none provided."
                                }
                            },
                            required: ["place_type", "location"]
                        }
                    }
                }]
            })
        });

        if (!ollamaRes.ok) throw new Error('Ollama is not responding');
        
        const ollamaData = await ollamaRes.json();
        
        if (ollamaData.message?.tool_calls && ollamaData.message.tool_calls.length > 0) {
            
            const extractedParams = ollamaData.message.tool_calls[0].function.arguments;
            console.log("🛠️ Llama 3.1 Tool Called Params:", extractedParams);

            const mapsRes = await fetch(`http://localhost:${process.env.PORT || 8080}/api/get-location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(extractedParams)
            });

            const mapsData = await mapsRes.json();
            res.json({ response_for_llm: mapsData.response_for_llm });

        } else if (ollamaData.message?.content) {
            
            let generalReply = ollamaData.message.content;
            const jsonSignature = '{"name": "search_google_maps"';
            if (generalReply.includes(jsonSignature)) {
                generalReply = generalReply.split(jsonSignature)[0];
            }
            generalReply = generalReply.trim();

            console.log("💬 Llama 3.1 General Reply:", generalReply);
            res.json({ response_for_llm: generalReply });
            
        } else {
            res.json({ response_for_llm: "I'm a bit confused. Could you rephrase your question?" });
        }

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ response_for_llm: "⚠️ Sorry, my AI brain (Ollama) is currently unreachable." });
    }
};