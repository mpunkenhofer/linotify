const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin');
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin');

const pkg = require('./package.json');
const manifest = require('./src/manifest');

module.exports = env => {
	return {
		mode: 'production',

		entry: {
			content: [
				'./src/content/content.ts',
				'./src/content/content.scss',
			],
			options: [
				'./src/options/options.ts',
				'./src/options/options.scss',
			],
			popup: [
				'./src/popup/popup.ts',
				'./src/popup/popup.scss',
			],
			background: './src/background/background.ts',
		},

		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: '[name].js',
		},

		plugins: [
			new webpack.ProgressPlugin(),
			new CopyPlugin([
				{ from: 'locales', to: '_locales/[name]/messages.json' },
				{ from: 'assets/images/linotify_icon*', to: 'assets/images/[name].[ext]' },
				// { from: 'assets/images/linotify_browser_action_icon*', to: 'assets/images/[name].[ext]' },
				{ from: 'assets/images/*.svg', to: 'assets/images/[name].[ext]' },
				{ from: 'assets/fonts/*.woff', to: 'assets/fonts/[name].[ext]' },
				{ from: 'assets/fonts/*.woff2', to: 'assets/fonts/[name].[ext]' },
				//{ from: 'assets/sounds/*', to: 'assets/sounds/[name].[ext]' },
				{ from: 'src/*/*.html', to: '[name].[ext]' },
			]),
			new WebpackExtensionManifestPlugin({
				config: {
					base: manifest,
					extend: {
						version: pkg.version,
						homepage_url: pkg.homepage
					}
				}
			}),
			new MiniCssExtractPlugin({
				filename: '[name].css',
			}),
			new IgnoreEmitPlugin([/\/style.js$/, /\/*.LICENSE*/]),
			new webpack.optimize.AggressiveMergingPlugin(),
			new webpack.optimize.OccurrenceOrderPlugin(),
			new ZipPlugin({
				path: 'zip',
				filename: `${pkg.name}-v${pkg.version}`,
			}),
		],
		optimization: {
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						output: {
							comments: false,
						},
					},
				}),
			],
		},

		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader',
					include: [path.resolve(__dirname, 'src')],
					exclude: [/node_modules/]
				},
				{
					test: /\.scss$/,
					include: [path.resolve(__dirname)],
					use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
				},
			]
		},

		resolve: {
			extensions: ['.ts', '.js', '.scss'],
		},
	};
};
