const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const dotenv = require("dotenv").config({
  path: path.resolve(__dirname, "../.env.development"),
});

module.exports = {
  context: path.resolve(__dirname, "../"),

  target: "web",

  mode: "development",

  entry: {
    bundle: path.resolve(__dirname, "../src"),
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  output: {
    path: path.join(__dirname, "/dist"),
    publicPath: "/",
    filename: "[name].js",
  },

  devtool: "eval-source-map",

  devServer: {
    historyApiFallback: true,
    compress: true,
    port: Number(process.env.PORT),
    host: process.env.HOST,
    hot: true,
    open: true,
    client: {
      overlay: true,
      progress: true,
    },
    static: {
      directory: path.join(__dirname, "dist"),
      watch: {
        ignored: /node_modules/,
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              happyPackMode: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "images/",
            },
          },
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: ["@svgr/webpack"],
      },
    ],
  },

  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.AutomaticPrefetchPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.WatchIgnorePlugin({ paths: [/node_modules/] }),
    new CopyPlugin({
      patterns: [{ from: "./assets/robots.txt", to: "dist" }],
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(dotenv.parse),
    }),
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: "./src/**/*.{ts,tsx,js,jsx}",
      },
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
    new HtmlWebpackPlugin({
      title: process.env.PAGE_TITLE,
      template: "./assets/templates/index.template.html",
      favicon: "./assets/icons/favicon.ico",
    }),
  ],

  optimization: {
    minimize: false,
  },
};
