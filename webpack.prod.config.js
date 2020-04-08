const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin');
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin');
const baseManifest = require('./public/manifest/base');
const pkg = require('./package.json');

module.exports = env => {
	return {
		mode: 'production',

		entry: {
			content: [
				'./src/content.ts',
				'./src/content.scss',
			],
			background: './src/background.ts',
			options: [
				'./src/options.ts',
				'./src/options.scss',
			],
		},

		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: '[name].js',
		},

		plugins: [
			new webpack.ProgressPlugin(),
			new CopyPlugin([
				{from: 'public/images/linotify_icon*', to: 'assets/[name].[ext]'},
				{from: 'public/images/*.svg', to: 'assets/[name].[ext]'},
				{from: 'locales', to: '_locales/[name]/messages.json'},
				{from: 'public/*.html', to: '[name].[ext]'},
				{from: 'public/fonts/*.woff', to: 'public/fonts/[name].[ext]'},
				{from: 'public/fonts/*.woff2', to: 'public/fonts/[name].[ext]'},
			]),
			new WebpackExtensionManifestPlugin({
				config: {
					base: baseManifest,
					extend: {
						version: pkg.version,
						homepage_url: pkg.homepage
					}
				}
			}),
			new MiniCssExtractPlugin({
				filename: '[name].css',
			}),
			new IgnoreEmitPlugin([/\/style.js$/, /\/*.LICENSE$/]),
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
