const path = require('path');

module.exports = {
  "stories": ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  "addons": ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions"],

  "framework": {
    name: '@storybook/react-webpack5',
    options: {}
  },

  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src/'),
      '@system': path.resolve(__dirname, '../src/system/'),
      '@components': path.resolve(__dirname, '../src/components/'),
    };
    return config;
  },

  docs: {
    autodocs: true
  }
};