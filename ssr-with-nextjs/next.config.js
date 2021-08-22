module.exports = {
  images: {
    disableStaticImages: true,
  },
  webpack: config => {
    config.module.rules.push({
      test: /.(png|jpg)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]?[hash]",
            emitFile: false,
            publicPath: "/",
          },
        },
      ],
    });
    return config;
  },
};
