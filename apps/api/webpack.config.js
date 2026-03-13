const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

const apiSrc = join(__dirname, 'src');

module.exports = {
  resolve: {
    alias: {
      '@api/shared': join(apiSrc, 'shared'),
      '@api/common': join(apiSrc, 'common'),
      '@api/modules': join(apiSrc, 'modules'),
      '@api/app': join(apiSrc, 'app'),
      '@api/database': join(apiSrc, 'database'),
    },
  },
  output: {
    path: join(__dirname, '../../dist/apps/api'),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
  ],
};
