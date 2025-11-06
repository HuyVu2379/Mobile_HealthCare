/**
 * Environment Configuration
 * 
 * IMPORTANT: Không commit file này với API keys thật vào Git
 * Sử dụng .env file hoặc environment variables trong production
 */

export const ENV_CONFIG = {
    // Stream Video SDK
    STREAM_API_KEY: 'YOUR_STREAM_API_KEY', // TODO: Replace with your Stream API Key

    // Backend API (nếu có)
    API_BASE_URL: __DEV__
        ? 'http://localhost:3000/api'
        : 'https://your-production-api.com/api',

    // Feature flags
    ENABLE_VIDEO_CALL: true,
    ENABLE_SCREEN_SHARING: false, // Coming soon
    ENABLE_CALL_RECORDING: false, // Coming soon

    // Debug mode
    DEBUG_VIDEO_LOGS: __DEV__,
};

// Validate required configs
if (!ENV_CONFIG.STREAM_API_KEY || ENV_CONFIG.STREAM_API_KEY === 'YOUR_STREAM_API_KEY') {
    console.warn(
        '⚠️ STREAM_API_KEY not configured! Please set it in src/config/env.config.ts\n' +
        'Get your API key from: https://getstream.io/dashboard/'
    );
}
