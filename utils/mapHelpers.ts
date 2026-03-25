// utils/mapHelpers.ts

import type { GoogleReview, GooglePlace } from '../types/map.types';

const PRICE_MAP = ['Free', 'Cheap ($)', 'Moderate ($$)', 'Expensive ($$$)', 'Very Expensive ($$$$)'];

export const formatPrice = (level?: number): string => {
    return level !== undefined && PRICE_MAP[level] ? PRICE_MAP[level] : 'Price unknown';
};

export const formatReview = (reviews?: GoogleReview[]): string => {
    if (!reviews || reviews.length === 0) return 'No written reviews yet.';
    const text = reviews[0].text.replace(/(\r\n|\n|\r)/gm, " ");
    return text.length > 100 ? `${text.substring(0, 100)}...` : text;
};

export const getApiKey = (): string => {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not configured in the .env file");
    return key;
};

export const generateStaticMapUrl = (place: GooglePlace, apiKey: string): string => {
    if (!place.geometry?.location) return '';
    
    const lat = place.geometry.location.lat;
    const lng = place.geometry.location.lng;
    const center = `${lat},${lng}`;
    
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = [
        `center=${encodeURIComponent(center)}`,
        `zoom=16`,
        `size=600x300`,
        `markers=color:red%7C${encodeURIComponent(center)}`,
        `key=${apiKey}`
    ];

    return `${baseUrl}?${params.join('&')}`;
};

export const generateEmbedMapIframe = (place: GooglePlace, apiKey: string): string => {
    const query = encodeURIComponent(`${place.name}, ${place.formatted_address}`);

    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}`;
    
    return `<iframe 
        width="100%" 
        height="400" 
        style="border:0; border-radius: 8px; margin-bottom: 15px;" 
        loading="lazy" 
        allowfullscreen 
        referrerpolicy="no-referrer-when-downgrade" 
        src="${embedUrl}">
    </iframe>`;
};