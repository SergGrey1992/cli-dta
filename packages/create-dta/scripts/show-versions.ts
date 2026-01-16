import chalk from 'chalk';
import { PACKAGE_VERSIONS } from '../src/config/versions.js';

console.log(chalk.bold('\n📦 Current Versions\n'));

console.log(chalk.blue('Dependencies:'));
Object.entries(PACKAGE_VERSIONS.dependencies).forEach(([pkg, ver]) => {
  console.log(`  ${pkg.padEnd(25)} ${chalk.green(ver)}`);
});

console.log(chalk.blue('\nDev Dependencies:'));
Object.entries(PACKAGE_VERSIONS.devDependencies).forEach(([pkg, ver]) => {
  console.log(`  ${pkg.padEnd(25)} ${chalk.green(ver)}`);
});

console.log();
