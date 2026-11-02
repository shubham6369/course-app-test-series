module.exports = {
  datasource: {
    db: {
      provider: "postgresql",
      url: process.env.DIRECT_URL,
    },
  },
  generator: {
    client: {
      provider: "prisma-client-js",
      previewFeatures: ["driverAdapters"],
    },
  },
};

