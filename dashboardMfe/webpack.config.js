const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const path = require('path');

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "set",
    projectName: "dashboardMfe",
    webpackConfigEnv,
    argv,
    outputSystemJS: false,
  });

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    output: {
      filename: "set-dashboardMfe.js",
      module: true,
      library: {
        type: "module"
      }
    },
    experiments: {
      outputModule: true
    },
    devServer: {
      port: 8080, // Specify your desired port here
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', 'mjs'],
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@microsoft/signalr": path.resolve(
          __dirname,
          "node_modules/@microsoft/signalr/dist/browser/signalr.js"
        )
      },
      fallback: {
        module: false,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        https: false,
        http: false,
        assert: false,
      }
    },
    module: {
      rules: [
        {
          test: /\.module\.scss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                },
                importLoaders: 1,
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader',
          ],
        }
        // ... other rules for JavaScript, images, etc.
      ],
    },
  });
};