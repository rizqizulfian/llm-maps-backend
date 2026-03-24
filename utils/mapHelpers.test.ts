import { formatPrice, formatReview, getApiKey } from './mapHelpers';

describe('Map Helpers Utilities', () => {
    
    describe('formatPrice', () => {
        it('should return the correct price string based on the level', () => {
            expect(formatPrice(0)).toBe('Free');
            expect(formatPrice(2)).toBe('Moderate ($$)');
            expect(formatPrice(4)).toBe('Very Expensive ($$$$)');
        });

        it('should return "Price unknown" if the level is invalid or undefined', () => {
            expect(formatPrice(undefined)).toBe('Price unknown');
            expect(formatPrice(10)).toBe('Price unknown');
        });
    });

    describe('formatReview', () => {
        it('should return the default message if reviews are empty or undefined', () => {
            expect(formatReview([])).toBe('No written reviews yet.');
            expect(formatReview(undefined)).toBe('No written reviews yet.');
        });

        it('should truncate text if it exceeds 100 characters and remove line breaks', () => {
            const longReview = [{ text: 'This is a very long review. '.repeat(5) }];
            const result = formatReview(longReview);
            
            expect(result.length).toBe(103);
            expect(result.endsWith('...')).toBe(true);
        });

        it('should format normal text correctly by replacing line breaks with spaces', () => {
            const normalReview = [{ text: 'Great place\nFriendly staff' }];
            const result = formatReview(normalReview);
            
            expect(result).toBe('Great place Friendly staff'); 
        });
    });

    describe('getApiKey', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            jest.resetModules();
            process.env = { ...originalEnv };
        });

        afterAll(() => {
            process.env = originalEnv;
        });

        it('should return the API Key if it is configured in .env', () => {
            process.env.GOOGLE_MAPS_API_KEY = 'TEST_API_KEY_123';
            expect(getApiKey()).toBe('TEST_API_KEY_123');
        });

        it('should throw an error if the API Key is missing', () => {
            delete process.env.GOOGLE_MAPS_API_KEY;
            expect(() => getApiKey()).toThrow('GOOGLE_MAPS_API_KEY is not configured in the .env file');
        });
    });
});