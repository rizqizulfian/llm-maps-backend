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
                body: { location: 'Batam' } // Missing 'place_type'
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

            // Mocking the fetch response to simulate an empty result
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce({ status: 'ZERO_RESULTS', results: [] })
            });

            await getLocation(req, res);

            expect(res.statusCode).toBe(200); 
            const data = res._getJSONData();
            expect(data.success).toBe(true);
            expect(data.response_for_llm).toContain('Sorry, could not find any');
        });
    });

    describe('getRoute Controller', () => {
        it('should return a 400 status if origin or destination is missing', async () => {
            const req = createRequest({
                method: 'POST',
                body: { origin: 'Jakarta' } // Missing 'destination'
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

            // Mocking a successful route response from Google Maps
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
            
            // Validate that the markdown text is assembled correctly
            expect(data.success).toBe(true);
            expect(data.response_for_llm).toContain('150 km');
            expect(data.response_for_llm).toContain('2 hours 30 mins');
            expect(data.response_for_llm).toContain('Jakarta, Indonesia');
        });
    });
});