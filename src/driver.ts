/*
|--------------------------------------------------------------------------
| Ally Yandex Oauth driver
|--------------------------------------------------------------------------
|
| This is an Ally Oauth driver for authenticating users via Yandex.
|
*/

import { Exception } from '@poppinss/utils'
import type { HttpContext } from '@adonisjs/core/http'
import type { HttpClient } from '@poppinss/oauth-client'
import type { YandexToken, YandexScopes, YandexDriverConfig } from './types.js'
import { Oauth2Driver, type RedirectRequest, type ApiRequest } from '@adonisjs/ally'
import type { ApiRequestContract } from '@adonisjs/ally/types'

/**
 * Yandex driver to login user via Yandex
 */
export class YandexDriver extends Oauth2Driver<YandexToken, YandexScopes> {
  protected accessTokenUrl = 'https://oauth.yandex.ru/token'
  protected authorizeUrl = 'https://oauth.yandex.ru/authorize'
  protected userInfoUrl = 'https://login.yandex.ru/info'

  protected userAvatarUrl = 'https://avatars.yandex.net/get-yapic'
  protected userAvatarSize = 'islands-200'

  /**
   * The param name for the authorization code
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the "yandex_oauth_state"
   */
  protected stateCookieName = 'yandex_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state
   * from yandex
   */
  protected stateParamName = 'state'

  /**
   * Parameter name for defining the scopes
   */
  protected scopeParamName = 'scope'

  /**
   * Scopes separator
   */
  protected scopesSeparator = ' '

  constructor(
    ctx: HttpContext,
    public config: YandexDriverConfig
  ) {
    super(ctx, config)
    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request
     */
    this.loadState()
  }

  /**
   * Configuring the redirect request with defaults
   */
  protected configureRedirectRequest(request: RedirectRequest<YandexScopes>) {
    /**
     * Define user defined scopes or the default one's
     */
    request.scopes(this.config.scopes || ['login:email', 'login:info', 'login:avatar'])

    /**
     * Set "response_type" param
     */
    request.param('response_type', 'code')
  }

  /**
   * Returns the HTTP request with the authorization header set
   */
  protected getAuthenticatedRequest(url: string, token: string): HttpClient {
    const request = this.httpClient(url)
    request.header('Authorization', `OAuth ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')
    return request
  }

  /**
   * Fetches the user info from the Yandex API
   */
  protected async getUserInfo(token: string, callback?: (request: ApiRequest) => void) {
    const url = this.config.userInfoUrl || this.userInfoUrl
    const userAvatarUrl = this.config.userAvatarUrl || this.userAvatarUrl
    const userAvatarSize = this.config.userAvatarSize || this.userAvatarSize
    const request = this.getAuthenticatedRequest(url, token)

    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()

    const avatarUrl = `${userAvatarUrl}/${body.default_avatar_id}/${userAvatarSize}`
    return {
      id: body.id,
      nickName: body.login,
      name: body.real_name,
      avatarUrl: body.default_avatar_id ? avatarUrl : '',
      original: body,
    }
  }

  /**
   * Fetches the user email from the Yandex API
   */
  protected async getUserEmail(token: string, callback?: (request: ApiRequest) => void) {
    const url = this.config.userInfoUrl || this.userInfoUrl
    const request = this.getAuthenticatedRequest(url, token)

    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()
    if (!body.default_email) {
      throw new Exception(
        'Cannot request user email. Make sure you are using the "login:email" scope'
      )
    }

    return body.default_email
  }

  /**
   * Find if the current error code is for access denied
   */
  accessDenied(): boolean {
    const error = this.getError()
    if (!error) {
      return false
    }

    return error === 'access_denied'
  }

  /**
   * Returns details for the authorized user
   */
  async user(callback?: (request: ApiRequestContract) => void) {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, callback)
    const email = await this.getUserEmail(token.token, callback)

    return {
      ...user,
      email: email,
      emailVerificationState: 'unsupported' as const,
      token: token,
    }
  }

  /**
   * Finds the user by the access token
   */
  async userFromToken(token: string, callback?: (request: ApiRequest) => void) {
    const user = await this.getUserInfo(token, callback)
    const email = await this.getUserEmail(token, callback)

    return {
      ...user,
      email: email,
      emailVerificationState: 'unsupported' as const,
      token: { token, type: 'bearer' as const },
    }
  }
}

/**
 * The factory function to reference the driver implementation
 * inside the "config/ally.ts" file.
 */
export function YandexDriverService(
  config: YandexDriverConfig
): (ctx: HttpContext) => YandexDriver {
  return (ctx) => new YandexDriver(ctx, config)
}
