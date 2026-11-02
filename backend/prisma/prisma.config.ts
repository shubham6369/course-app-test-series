import { defineConfig } from '@prisma/client/runtime';

export default defineConfig({
  datasource: {
    db: {
      provider: 'postgresql',
      url: process.env.DIRECT_URL,
    },
  },
  generator: {
    client: {
      provider: 'prisma-client-js',
      previewFeatures: ['driverAdapters'],
    },
  },
});
