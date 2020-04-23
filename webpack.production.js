const pkg = require( './package.json');
const manifest = require( './src/manifest.json');
const commonWebpackConfiguration = require( './webpack.common');

const path = require( 'path');
const merge = require( 'webpack-merge');

const ZipPlugin = require( 'zip-webpack-plugin');
const TerserPlugin = require( 'terser-webpack-plugin');
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin');
const WebpackExtensionManifestPlugin = require( 'webpack-extension-manifest-plugin');

module.exports = merge(commonWebpackConfiguration, {
    mode: 'production',
    performance: {
        // warn if we go even further beyond... 
        //since we develop a extension we don't need to care so much for size because we already have it on the disk.
        maxEntrypointSize: 2000000,
        maxAssetSize: 2000000
    },
    module: {
		rules: [
			{
				test: /\.scss$/,
				include: [path.resolve(__dirname, 'src')],
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
			},
        ]
    },
    plugins: [
        new WebpackExtensionManifestPlugin({
            config: {
                base: manifest,
                extend: {
                    version: pkg.version,
                    homepage_url: pkg.homepage
                }
            }
        }),
        new ZipPlugin({
            path: 'zip',
            filename: `${pkg.name}-v${pkg.version}`,
        })
    ],
    optimization: {
        // Without this, function names will be garbled and enableFeature won't work
        concatenateModules: true,

        // Automatically enabled on production; keeps it somewhat readable for AMO reviewers
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    mangle: false,
                    compress: {
                        defaults: false,
                        dead_code: true,
                        unused: true,
                        arguments: true,
                        join_vars: false,
                        booleans: false,
                        expression: false,
                        sequences: false
                    },
                    output: {
                        beautify: true,
                        indent_level: 2
                    }
                }
            })
        ]
    }
});