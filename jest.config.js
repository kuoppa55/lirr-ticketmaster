module.exports = {
    preset: 'jest-expo',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'src/background/**/*.js',
        'src/utils/**/*.js',
        'src/services/**/*.js',
        'src/data/**/*.js',
        '!src/data/stations.dataset.js',
    ],
    coverageThreshold: {
        'src/services/**/*.js': {
            statements: 55,
            branches: 55,
        },
        'src/background/**/*.js': {
            statements: 85,
            branches: 70,
        },
    },
};
