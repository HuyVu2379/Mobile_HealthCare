/**
 * Polyfills for React Native to support @stomp/stompjs
 * Import this file early in your app (App.tsx or index.js)
 */

import { Buffer } from 'buffer';
import { TextDecoder, TextEncoder } from 'text-encoding';

declare var global: any;

// Buffer polyfill
if (typeof global.Buffer === 'undefined') {
    global.Buffer = Buffer;
}

// TextEncoder/TextDecoder polyfill
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}

// Process polyfill (if needed)
if (typeof global.process === 'undefined') {
    global.process = {
        env: {},
        nextTick: (fn: Function, ...args: any[]) => {
            setTimeout(() => fn(...args), 0);
        },
        version: '',
        platform: 'react-native',
    } as any;
}

export { };