# AdonisJS 6 Ally Yandex Driver

A Yandex driver for [AdonisJS Ally](https://docs.adonisjs.com/guides/social-auth).

## Getting started

### 1. Install the package

Install the package from your command line.

```bash
npm i adonis6-ally-yandex
```
or
```bash
yarn add adonis6-ally-yandex
```

### 2. Add ENV variables to your `./start/env.ts` file for validation

```typescript
...
  YANDEX_CLIENT_ID: Env.schema.string(),
  YANDEX_CLIENT_SECRET: Env.schema.string(),
```

### 3. Add ENV variables to your `.env` file, and optionally to your `.env.example` file

```bash
YANDEX_CLIENT_ID=your_client_id
YANDEX_CLIENT_SECRET=your_client_secret
```

### 4. Add the provider to allyConfig in your `./config/ally.ts` file

```typescript
import { YandexDriverService } from 'adonis6_ally_yandex'

const allyConfig = defineConfig({
  ...
  yandex: YandexDriverService({
    clientId: env.get('YANDEX_CLIENT_ID'),
    clientSecret: env.get('YANDEX_CLIENT_SECRET'),
    // Define here your callback URL, e.g.:
    callbackUrl: `${env.get('APP_URL')}/auth/yandex/callback`,

    //
    // Additional options
    //
    // Use additional scopes if needed (default: ['login:email', 'login:info', 'login:avatar'])
    // e.g:
    scopes: ['login:email', 'login:info', 'login:avatar', 'login:birthday', 'login:default_phone'],

    // Use custom url getting user info (default: 'https://login.yandex.ru/info'):
    userInfoUrl: 'https://login.yandex.ru/info',

    // Use custom url getting access token (default: 'https://oauth.yandex.ru/token') e.g.:
    accessTokenUrl: 'https://oauth.yandex.com/token',

    // Use custom url getting authorize token (default: 'https://oauth.yandex.ru/authorize') e.g.:
    authorizeUrl: 'https://oauth.yandex.com/authorize',

    // Use custom url getting user avatar (default: 'https://avatars.yandex.net/get-yapic'):
    userAvatarUrl: 'https://avatars.yandex.net/get-yapic',

    // Use custom url getting user avatar size (default: 'islands-200') 
    // All sizes you can find here: https://yandex.ru/dev/id/doc/ru/user-information#avatar-access
    // e.g.:
    userAvatarSize: 'islands-200',
  }),
  ...
})
```


