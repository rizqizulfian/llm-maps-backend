// types/map.types.ts

export interface LocationRequestBody {
    location: string;
    place_type: string;
}

export interface RouteRequestBody {
    origin: string;
    destination: string;
}

export interface GoogleReview {
    text: string;
}

export interface GooglePlaceLocation {
    lat: number;
    lng: number;
}

export interface GooglePlaceGeometry {
    location: GooglePlaceLocation;
}

export interface GooglePlace {
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    opening_hours?: { open_now: boolean };
    reviews?: GoogleReview[];
    url?: string;
    geometry?: GooglePlaceGeometry; // Tambahan untuk Static Map
    types?: string[];
}