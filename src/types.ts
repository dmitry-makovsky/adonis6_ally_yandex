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
  accessTokenUrl?: string
  authorizeUrl?: string
  userAvatarUrl?: string
  userAvatarSize?:
    | 'islands-small'
    | 'islands-34'
    | 'islands-middle'
    | 'islands-50'
    | 'islands-retina-small'
    | 'islands-68'
    | 'islands-75'
    | 'islands-retina-middle'
    | 'islands-retina-50'
    | 'islands-200'
}
