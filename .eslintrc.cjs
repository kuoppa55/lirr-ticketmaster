module.exports = {
    root: true,
    extends: ['expo', 'prettier'],
    env: {
        jest: true,
        browser: true,
    },
    rules: {
        'no-console': ['error', { allow: ['log', 'warn', 'error'] }],
    },
};
