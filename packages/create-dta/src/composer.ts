import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import chalk from 'chalk';
import degit from 'degit';
import { PACKAGE_VERSIONS } from './config/versions.js';
import { sortObject } from './utils/helpers.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CreateProjectOptions {
  projectName: string;
  baseTemplate: string;
  features: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  skipInstall: boolean;
}

// Список доступных фич - просто для проверки
const AVAILABLE_FEATURES = ['rbac', 'feature-flags'];

export async function createProject(options: CreateProjectOptions) {
  const { projectName, baseTemplate, features, packageManager, skipInstall } = options;
  const projectPath = path.resolve(process.cwd(), projectName);

  // Проверка существования папки
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory ${projectName} already exists`);
  }

  // 1. Клонируем базовый Turborepo шаблон с GitHub
  console.log(chalk.blue(`📦 Cloning: ${baseTemplate}...\n`));

  const emitter = degit(baseTemplate, {
    cache: false,
    force: true,
  });

  await emitter.clone(projectPath);
  console.log(chalk.green('✓ Base cloned\n'));

  // 2. Обновляем версии пакетов до последних
  await updatePackageVersions(projectPath);

  // 3. Добавляем фичи
  if (features.length > 0) {
    console.log(chalk.blue('📦 Adding features...\n'));
    for (const feature of features) {
      await addFeature(projectPath, feature);
    }
  }

  // 4. Обновляем root package.json
  await updateRootPackageJson(projectPath, projectName);

  // 5. Создаём метаданные
  await fs.writeJSON(
    path.join(projectPath, '.dta.json'),
    {
      features,
      baseTemplate,
      createdAt: new Date().toISOString(),
      cliVersion: '1.0.0',
    },
    { spaces: 2 }
  );

  // 6. Обновляем README
  await updateReadme(projectPath, projectName, features);

  // 7. Устанавливаем зависимости
  if (!skipInstall) {
    console.log(chalk.blue(`\n📦 Installing with ${packageManager}...\n`));
    try {
      const cmd = packageManager === 'npm' ? 'npm install' : `${packageManager} install`;
      execSync(cmd, {
        cwd: projectPath,
        stdio: 'inherit',
      });
      console.log(chalk.green('\n✓ Installed'));
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  Install failed'));
      console.log(chalk.gray(`Run: cd ${projectName} && ${packageManager} install`));
    }
  }
}

async function updatePackageVersions(projectPath: string) {
  console.log(chalk.blue('🔄 Updating to latest versions...\n'));

  const packageJsonFiles = [
    'package.json',
    'apps/docs/package.json',
    'apps/web/package.json',
    'packages/ui/package.json',
    'packages/eslint-config/package.json',
    'packages/typescript-config/package.json',
  ];

  for (const file of packageJsonFiles) {
    const filePath = path.join(projectPath, file);

    if (await fs.pathExists(filePath)) {
      const pkg = await fs.readJSON(filePath);

      // Обновляем dependencies
      if (pkg.dependencies) {
        for (const dep in pkg.dependencies) {
          if (PACKAGE_VERSIONS.dependencies[dep]) {
            pkg.dependencies[dep] = PACKAGE_VERSIONS.dependencies[dep];
          }
        }
      }

      // Обновляем devDependencies
      if (pkg.devDependencies) {
        for (const dep in pkg.devDependencies) {
          if (PACKAGE_VERSIONS.devDependencies[dep]) {
            pkg.devDependencies[dep] = PACKAGE_VERSIONS.devDependencies[dep];
          }
        }
      }

      await fs.writeJSON(filePath, pkg, { spaces: 2 });
      console.log(chalk.gray(`  ✓ ${file}`));
    }
  }

  console.log(chalk.green('\n✓ Versions updated\n'));
}

async function addFeature(projectPath: string, feature: string) {
  console.log(chalk.blue(`  Adding ${chalk.bold(feature)}...`));

  // Проверяем что фича в списке доступных
  if (!AVAILABLE_FEATURES.includes(feature)) {
    console.log(chalk.yellow(`  ⚠️  Unknown feature: ${feature}`));
    return;
  }

  // Путь к исходной папке фичи в шаблонах
  const sourcePath = path.join(__dirname, '../templates/features', feature);

  // Путь куда копировать: packages/{feature}/
  const destPath = path.join(projectPath, 'packages', feature);

  // Проверяем что папка фичи существует
  if (await fs.pathExists(sourcePath)) {
    // Копируем всю папку целиком
    await fs.copy(sourcePath, destPath, {
      overwrite: false,
    });
    console.log(chalk.green(`  ✓ Copied to packages/${feature}/`));
  } else {
    console.log(chalk.yellow(`  ⚠️  Template not found: ${feature}`));
    console.log(chalk.gray(`    Expected at: ${sourcePath}`));
  }
}

async function updateRootPackageJson(projectPath: string, projectName: string) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const pkg = await fs.readJSON(packageJsonPath);

  pkg.name = projectName;
  pkg.version = '0.1.0';

  await fs.writeJSON(packageJsonPath, pkg, { spaces: 2 });
}

async function updateReadme(
  projectPath: string,
  projectName: string,
  features: string[]
) {
  const readme = `# ${projectName}

Created with [\`create-dta\`](https://github.com/your-company/create-dta)

## Stack

- ✅ Turborepo
- ✅ Next.js ${PACKAGE_VERSIONS.dependencies['next']}
- ✅ React ${PACKAGE_VERSIONS.dependencies['react']}
- ✅ TypeScript ${PACKAGE_VERSIONS.devDependencies['typescript']}
- ✅ Tailwind CSS ${PACKAGE_VERSIONS.devDependencies['tailwindcss']}
${features.length > 0 ? features.map(f => `- ✅ ${f.toUpperCase()}`).join('\n') : ''}

## What's inside?

This Turborepo includes the following packages/apps:

### Apps
- \`docs\`: Documentation site
- \`web\`: Main web application

### Packages
- \`@repo/ui\`: Shared React component library
- \`@repo/eslint-config\`: ESLint configurations
- \`@repo/typescript-config\`: TypeScript configurations
${features.length > 0 ? features.map(f => `- \`@repo/${f}\`: ${f} package`).join('\n') : ''}

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Build all apps and packages
pnpm build
\`\`\`

## Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}
