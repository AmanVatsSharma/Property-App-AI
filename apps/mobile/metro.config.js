const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..', '..');

// Resolve path aliases from tsconfig.base.json (single source of truth)
const tsconfigBasePath = path.join(monorepoRoot, 'tsconfig.base.json');
const tsconfigBase = JSON.parse(fs.readFileSync(tsconfigBasePath, 'utf8'));
const pathMappings = tsconfigBase.compilerOptions?.paths || {};
const baseUrl = path.join(monorepoRoot, tsconfigBase.compilerOptions?.baseUrl || '.');

const extraNodeModules = {};
Object.entries(pathMappings).forEach(([alias, targets]) => {
  if (alias.endsWith('/*')) return; // skip wildcard keys; we use the concrete one
  const target = Array.isArray(targets) ? targets[0] : targets;
  if (!target) return;
  const resolved = path.resolve(baseUrl, target);
  const dir = path.dirname(resolved);
  extraNodeModules[alias] = dir;
});

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.extraNodeModules = extraNodeModules;

module.exports = withNativeWind(config, { input: './global.css' });
