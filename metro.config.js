// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure .web.tsx files are properly resolved for web platform
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.tsx', 'web.ts', 'web.jsx', 'web.js'];

// Ensure platform-specific extensions are resolved in correct order
config.resolver.platforms = ['web', 'ios', 'android'];

module.exports = config;

