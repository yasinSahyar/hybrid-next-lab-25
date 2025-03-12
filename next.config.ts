// next.config.js
module.exports = {
  webpack: (config) => {
    config.externals = {
      ...config.externals,
      'mysql2': 'commonjs mysql2',
    };
    return config;
  },
};