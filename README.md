# @serggrey1992/create-app

CLI для создания DTA проектов на базе Turborepo с поддержкой современного стека технологий.

## Быстрый старт
```bash
npx @serggrey1992/create-app my-project
```

## Использование

### Базовая команда
```bash
npx @serggrey1992/create-app my-project
```

### С опциями
```bash
npx @serggrey1992/create-app my-project \
  --base=with-tailwind \
  --template=rbac+feature-flags \
  --package-manager=pnpm
```

## Опции

### `--base`
Выбор базового шаблона:
- `default` - базовая конфигурация
- `with-tailwind` - с настроенным Tailwind CSS

### `--template`
Дополнительные функции (можно комбинировать через `+`):
- `rbac` - Role-Based Access Control система
- `feature-flags` - Feature Flags для управления функциональностью
- `rbac+feature-flags` - обе функции вместе

### `--package-manager`
Выбор пакетного менеджера:
- `pnpm` (рекомендуется)
- `npm`
- `yarn`

## Что входит

- ⚡️ **Turborepo** - высокопроизводительная монорепо система
- 🎨 **Tailwind CSS** - утилитарный CSS фреймворк (опционально)
- 🔐 **RBAC** - система управления доступом на основе ролей (опционально)
- 🚩 **Feature Flags** - управление функциональностью (опционально)
- 📦 **TypeScript** - типизация из коробки
- 🔧 **Next.js 14+** - современный React фреймворк

## Примеры

### Минимальный проект
```bash
npx @serggrey1992/create-app my-app
```

### Проект с Tailwind
```bash
npx @serggrey1992/create-app my-app --base=with-tailwind
```

### Полнофункциональный проект
```bash
npx @serggrey1992/create-app my-app \
  --base=with-tailwind \
  --template=rbac+feature-flags \
  --package-manager=pnpm
```

## После создания
```bash
cd my-project
pnpm install  # или npm install / yarn install
pnpm dev      # запуск в режиме разработки
```

## Ссылки

- [GitHub](https://github.com/SergGrey1992/cli-dta)
- [npm](https://www.npmjs.com/package/@serggrey1992/create-app)
- [Issues](https://github.com/SergGrey1992/cli-dta/issues)

## Автор

[SergGrey1992](https://github.com/SergGrey1992)

## Лицензия

MIT
