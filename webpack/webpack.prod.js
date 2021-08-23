const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const dotenv = require("dotenv").config({
  path: path.resolve(__dirname, "../.env.production"),
});

module.exports = {
  context: path.resolve(__dirname, "../"),

  mode: "production",

  entry: {
    bundle: path.resolve(__dirname, "../src"),
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "react-dom$": "react-dom/profiling",
      "scheduler/tracing": "scheduler/tracing-profiling",
    },
  },

  output: {
    path: path.join(__dirname, "../dist"),
    publicPath: "/",
    filename: "static/js/[name]~[contenthash:16].js",
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
        exclude: /node_modules/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name]~[contenthash:16].[ext]",
              outputPath: "static/images/",
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
    new CleanWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new CopyPlugin({
      patterns: [{ from: "./assets/robots.txt", to: "./" }],
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
    minimize: true,
    moduleIds: "deterministic",
    runtimeChunk: {
      name: "runtime",
    },
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        parallel: 4,
        extractComments: true,
        terserOptions: {
          output: {
            comments: /@license/i,
          },
        },
      }),
    ],
  },
};
