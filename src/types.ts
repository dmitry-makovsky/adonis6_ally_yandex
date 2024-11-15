export interface YandexToken {
  token: string
  type: 'bearer'
  expires_in: number
  refresh_token?: string
}

export type YandexScopes =
  | 'login:avatar'
  | 'login:birthday'
  | 'login:email'
  | 'login:info'
  | 'login:default_phone'

export interface YandexDriverConfig {
  clientId: string
  clientSecret: string
  callbackUrl: string
  scopes?: YandexScopes[]
  userInfoUrl?: string
}
