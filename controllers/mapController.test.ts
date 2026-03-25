import { getLocation, getRoute } from './mapController';
import { createRequest, createResponse } from 'node-mocks-http';

global.fetch = jest.fn();

describe('Map Controllers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GOOGLE_MAPS_API_KEY = 'FAKE_KEY';
    });

    describe('getLocation Controller', () => {
        it('should return a 400 status if required parameters are missing', async () => {
            const req = createRequest({
                method: 'POST',
                body: { location: 'Batam' }
            });
            const res = createResponse();

            await getLocation(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ error: 'Parameters location and place_type are required.' });
        });

        it('should return a success message for LLM if no results are found by Google Maps', async () => {
            const req = createRequest({
                method: 'POST',
                body: { location: 'Batam', place_type: 'Alien Base' }
            });
            const res = createResponse();

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce({ status: 'ZERO_RESULTS', results: [] })
            });

            await getLocation(req, res);

            expect(res.statusCode).toBe(200); 
            const data = res._getJSONData();
            expect(data.success).toBe(true);
            expect(data.response_for_llm).toContain('Sorry, could not find any');
        });

        it('should successfully assemble markdown including the static map for the top result', async () => {
            const req = createRequest({
                method: 'POST',
                body: { location: 'Batam', place_type: 'Cafe' }
            });
            const res = createResponse();

            (global.fetch as jest.Mock).mockImplementation((url: string) => {
                if (url.includes('textsearch')) {
                    return Promise.resolve({
                        json: () => Promise.resolve({
                            status: 'OK',
                            results: [{ place_id: 'place1' }, { place_id: 'place2' }]
                        })
                    });
                }
                if (url.includes('details') && url.includes('place1')) {
                    return Promise.resolve({
                        json: () => Promise.resolve({
                            result: {
                                name: 'Top Cafe Batam',
                                formatted_address: 'Top St',
                                place_id: 'place1',
                                geometry: { location: { lat: 1.1, lng: 104.1 } }
                            }
                        })
                    });
                }
                if (url.includes('details') && url.includes('place2')) {
                    return Promise.resolve({
                        json: () => Promise.resolve({
                            result: {
                                name: 'Second Cafe Batam',
                                formatted_address: 'Second St',
                                place_id: 'place2',
                                geometry: { location: { lat: 1.2, lng: 104.2 } }
                            }
                        })
                    });
                }
                return Promise.resolve({ json: () => Promise.resolve({}) });
            });

            await getLocation(req, res);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            
            expect(data.success).toBe(true);
            expect(data.response_for_llm).toContain('Top Cafe Batam');
            expect(data.response_for_llm).toContain('Second Cafe Batam');

            expect(data.response_for_llm).toContain('https://maps.googleapis.com/maps/api/staticmap');
            expect(data.response_for_llm).toContain('center=1.1%2C104.1');
        });
    });

    describe('getRoute Controller', () => {
        it('should return a 400 status if origin or destination is missing', async () => {
            const req = createRequest({
                method: 'POST',
                body: { origin: 'Jakarta' }
            });
            const res = createResponse();

            await getRoute(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ error: 'Parameters origin and destination are required.' });
        });

        it('should successfully assemble the route text if the Google API responds correctly', async () => {
            const req = createRequest({
                method: 'POST',
                body: { origin: 'Jakarta', destination: 'Bandung' }
            });
            const res = createResponse();

            const mockGoogleResponse = {
                status: 'OK',
                routes: [{
                    legs: [{
                        distance: { text: '150 km' },
                        duration: { text: '2 hours 30 mins' },
                        start_address: 'Jakarta, Indonesia',
                        end_address: 'Bandung, West Java, Indonesia'
                    }]
                }]
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockGoogleResponse)
            });

            await getRoute(req, res);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            
            expect(data.success).toBe(true);
            expect(data.response_for_llm).toContain('150 km');
            expect(data.response_for_llm).toContain('2 hours 30 mins');
            expect(data.response_for_llm).toContain('Jakarta, Indonesia');
        });
    });
});