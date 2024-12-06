import type Configure from '@adonisjs/core/commands/configure'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  await codemods.defineEnvVariables({
    YANDEX_CLIENT_ID: '',
    YANDEX_CLIENT_SECRET: '',
  })

  await codemods.defineEnvValidations({
    variables: {
      YANDEX_CLIENT_ID: 'Env.schema.string()',
      YANDEX_CLIENT_SECRET: 'Env.schema.string()',
    },
    leadingComment: 'Variables for adonis6_ally_yandex',
  })
}
