import { getLocation, getRoute, chatWithAI } from './mapController';
import { createRequest, createResponse } from 'node-mocks-http';

global.fetch = jest.fn();

describe('Map Controllers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GOOGLE_MAPS_API_KEY = 'FAKE_KEY';
        process.env.PORT = '8080';

        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
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

        it('should successfully assemble markdown including both static and interactive maps for the top result', async () => {
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

            expect(data.response_for_llm).toContain('<iframe');
            expect(data.response_for_llm).toContain('Top Result Maps');
            expect(data.response_for_llm).toContain('Interactive Map:');
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

    describe('chatWithAI Controller', () => {
        it('should return 400 if prompt is missing', async () => {
            const req = createRequest({ method: 'POST', body: {} });
            const res = createResponse();

            await chatWithAI(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ error: 'Prompt is required' });
        });

        it('should return an error message if Ollama fetch fails', async () => {
            const req = createRequest({ method: 'POST', body: { prompt: 'Find me seafood' } });
            const res = createResponse();

            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

            await chatWithAI(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData().response_for_llm).toContain('unreachable');
        });

        it('should return a fallback message if Llama does not use tool calls', async () => {
            const req = createRequest({ method: 'POST', body: { prompt: 'Just saying hello' } });
            const res = createResponse();

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({
                    message: { content: "Hello there!", tool_calls: [] }
                })
            });

            await chatWithAI(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().response_for_llm).toContain("I couldn't understand what place you are looking for");
        });

        it('should extract parameters and fetch location data successfully', async () => {
            const req = createRequest({ method: 'POST', body: { prompt: 'where the best seafood at batam?' } });
            const res = createResponse();

            (global.fetch as jest.Mock).mockImplementation((url: string) => {
                if (url.includes('11434/api/chat')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            message: {
                                tool_calls: [{
                                    function: {
                                        arguments: { place_type: 'seafood', location: 'Batam' }
                                    }
                                }]
                            }
                        })
                    });
                }
                if (url.includes('api/get-location')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            response_for_llm: 'Here is the seafood map: [Map Link]'
                        })
                    });
                }
                return Promise.resolve({ json: () => Promise.resolve({}) });
            });

            await chatWithAI(req, res);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();

            expect(data.response_for_llm).toBe('Here is the seafood map: [Map Link]');
        });
    });

    describe('chatWithAI Controller', () => {
        it('should return 400 if prompt is missing', async () => {
            const req = createRequest({ method: 'POST', body: {} });
            const res = createResponse();
            
            await chatWithAI(req, res);
            
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ error: 'Prompt is required' });
        });

        it('should return an error message if Ollama fetch fails', async () => {
            const req = createRequest({ method: 'POST', body: { prompt: 'Hello' } });
            const res = createResponse();
            
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));
            
            await chatWithAI(req, res);
            
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData().response_for_llm).toContain('unreachable');
        });

        it('should return the general AI response if Llama answers conversationally', async () => {
            const req = createRequest({ method: 'POST', body: { prompt: 'Why is the sky blue?' } });
            const res = createResponse();
            
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({
                    message: { content: "The sky is blue because of Rayleigh scattering." }
                })
            });
            
            await chatWithAI(req, res);
            
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().response_for_llm).toBe("The sky is blue because of Rayleigh scattering.");
        });

        it('should strip hallucinated JSON signature from general conversational reply', async () => {
            const req = createRequest({ method: 'POST', body: { prompt: 'Why is the sky blue?' } });
            const res = createResponse();

            const hallucinatedResponse = 'The sky is blue. {"name": "search_google_maps", "parameters": {"location": "Batam"}}';
            
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({
                    message: { content: hallucinatedResponse }
                })
            });
            
            await chatWithAI(req, res);
            
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().response_for_llm).toBe("The sky is blue.");
        });
    });
});