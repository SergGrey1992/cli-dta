#!/usr/bin/env node
import { program } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import { createProject } from './composer.js';
import { TURBOREPO_TEMPLATES, type TemplateKey } from './config/templates.js';

interface CLIOptions {
  template?: string;
  base?: string;
  packageManager?: string;
  skipInstall?: boolean;
}

program
  .name('create-tda')
  .description('Create a new TDA project with Turborepo')
  .version('1.0.0')
  .argument('[project-name]', 'Project name')
  .option('-t, --template <features>', 'TDA features: rbac+feature-flags')
  .option('-b, --base <template>', 'Base Turborepo template (with-tailwind, basic, etc.)')
  .option('-m, --package-manager <pm>', 'Package manager (npm, yarn, pnpm, bun)', 'pnpm')
  .option('--skip-install', 'Skip installing dependencies', false)
  .action(async (projectName: string | undefined, options: CLIOptions) => {
    console.log(chalk.blue.bold('\n🚀 Create TDA App\n'));

    // 1. Имя проекта
    let name = projectName;
    if (!name) {
      const response = await prompts({
        type: 'text',
        name: 'name',
        message: 'Project name:',
        initial: 'my-tda-app',
        validate: (value: string) =>
          value.length > 0 ? true : 'Project name is required',
      });

      if (!response.name) {
        console.log(chalk.red('\n❌ Cancelled'));
        process.exit(1);
      }

      name = response.name;
    }

    // 2. Выбор базового Turborepo шаблона
    let baseTemplateUrl = '';

    if (options.base) {
      // ✅ Проверяем что ключ валидный
      if (options.base in TURBOREPO_TEMPLATES) {
        const templateKey = options.base as TemplateKey;
        const template = TURBOREPO_TEMPLATES[templateKey];
        baseTemplateUrl = template.url || options.base;
      } else {
        // Custom URL из CLI
        baseTemplateUrl = options.base;
      }
    } else {
      // Интерактивный выбор
      const response = await prompts({
        type: 'select',
        name: 'baseTemplate',
        message: 'Choose Turborepo base template:',
        choices: Object.entries(TURBOREPO_TEMPLATES).map(([key, template]) => ({
          title: template.name,
          description: template.description,
          value: key,
        })),
        initial: 0,
      });

      const selectedKey = response.baseTemplate as TemplateKey | undefined;

      if (!selectedKey) {
        console.log(chalk.red('\n❌ Cancelled'));
        process.exit(1);
      }

      if (selectedKey === 'custom') {
        const customResponse = await prompts({
          type: 'text',
          name: 'url',
          message: 'GitHub repository (owner/repo/path):',
          initial: 'vercel/turborepo/examples/basic',
          validate: (value: string) =>
            value.includes('/') ? true : 'Invalid format. Example: owner/repo/path',
        });

        if (!customResponse.url) {
          console.log(chalk.red('\n❌ Cancelled'));
          process.exit(1);
        }

        baseTemplateUrl = customResponse.url;
      } else {
        // ✅ Безопасная индексация
        const template = TURBOREPO_TEMPLATES[selectedKey];
        baseTemplateUrl = template?.url || TURBOREPO_TEMPLATES['with-tailwind'].url;
      }
    }

    // 3. Выбор TDA фич
    let features: string[] = [];
    if (options.template) {
      features = options.template
        .split('+')
        .map((f: string) => f.trim().replace(/^with-/, ''));
    } else {
      const response = await prompts({
        type: 'multiselect',
        name: 'features',
        message: 'Select TDA features:',
        choices: [
          {
            title: 'RBAC',
            value: 'rbac',
            description: 'Role-Based Access Control',
          },
          {
            title: 'Feature Flags',
            value: 'feature-flags',
            description: 'Feature toggle system',
          },
        ],
        hint: '- Space to select. Return to submit',
      });

      features = response.features || [];
    }

    // 4. Package manager
    let packageManager = options.packageManager || 'pnpm';

    // 5. Показываем конфигурацию
    console.log(chalk.blue('\n📦 Configuration:'));
    console.log(chalk.gray(`  Name:     ${name}`));
    console.log(chalk.gray(`  Base:     ${baseTemplateUrl}`));
    console.log(chalk.gray(`  Manager:  ${packageManager}`));
    if (features.length > 0) {
      console.log(chalk.gray(`  Features: ${features.join(', ')}`));
    } else {
      console.log(chalk.gray(`  Features: none (base only)`));
    }
    console.log();

    // 6. Создаём проект
    try {
      await createProject({
        projectName: name!,
        baseTemplate: baseTemplateUrl,
        features,
        packageManager: packageManager as 'npm' | 'yarn' | 'pnpm' | 'bun',
        skipInstall: options.skipInstall || false,
      });

      console.log(chalk.green.bold('\n✨ Success!\n'));
      console.log(chalk.gray('Next steps:'));
      console.log(chalk.cyan(`  cd ${name}`));
      console.log(chalk.cyan(`  ${packageManager} dev`));
      console.log();
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error);
      process.exit(1);
    }
  });

program.parse();
