const pkg = require("./package.json");
const { merge } = require("webpack-merge");
const manifest = require("./src/manifest.json");
const commonWebpackConfiguration = require("./webpack.common");
const ExtensionReloader = require("webpack-ext-reloader");
const WebpackExtensionManifestPlugin = require("webpack-extension-manifest-plugin");

module.exports = merge(commonWebpackConfiguration, {
  mode: "development",
  devtool: "inline-source-map",
  watch: true,

  module: {
    rules: [
      {
        test: /\.svg$/,
        type: "asset/inline",
      },
    ]
  },
  plugins: [
    new WebpackExtensionManifestPlugin({
      config: {
        base: manifest,
        extend: {
          name: "LiNotify - Dev Build",
          version: pkg.version,
          homepage_url: pkg.homepage,
        },
      },
    }),
    new ExtensionReloader({
      reloadPage: false, // Force the reload of the page also
      entries: {
        // The entries used for the content/background scripts
        contentScript: "content", // Use the entry names, not the file name or the path
        background: "background", // *REQUIRED
      },
    }),
  ],
});
