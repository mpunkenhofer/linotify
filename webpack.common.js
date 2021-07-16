const path = require("path");
const webpack = require("webpack");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    content: ["./src/content/content.ts", "./src/content/content.scss"],
    background: ["./src/background/background.ts"],
    options: ["./src/options/options.ts", "./src/options/options.scss"],
    popup: ["./src/popup/popup.ts", "./src/popup/popup.scss"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              // Make compilation faster with `fork-ts-checker-webpack-plugin`
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        include: [path.resolve(__dirname, "src")],
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "resolve-url-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(woff2?|ttf|otf|eot)/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
      {
        test: /\.png/,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "locales",
          to: "_locales/[name]/messages.json",
        },
        {
          from: "assets/images/linotify_icon*",
          to: "images/[name][ext]",
        }
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new IgnoreEmitPlugin([/\/style.js$/, /\/*.LICENSE*/]),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ["popup"],
      filename: "popup.html",
      template: "src/popup/popup.html",
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ["options"],
      filename: "options.html",
      template: "src/options/options.html",
    }),
    //new FontPreloadPlugin(),
  ],
  resolve: {
    extensions: [".ts", ".js", ".scss"],
  },
};
