const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    server: {
        port: 8989,
    },
    resolver: {
        alias: {
            'buffer': 'buffer',
            'text-encoding': 'text-encoding',
        },
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
