module.exports = {
    preset: 'jest-expo',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'src/utils/**/*.js',
        'src/services/**/*.js',
        'src/data/**/*.js',
        '!src/data/stations.dataset.js',
    ],
};
