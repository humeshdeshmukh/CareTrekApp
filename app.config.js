// Learn more: https://docs.expo.dev/guides/environment-variables/
module.exports = {
  expo: {
    name: 'CareTrek',
    slug: 'caretrek',
    version: '1.0.0',
    orientation: 'portrait',
    extra: {
      // Add your Google Cloud Translation API key here
      // In production, use EAS secrets or a similar service
      // DO NOT commit your actual API key to version control
      GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY || '',
    },
  },
};
