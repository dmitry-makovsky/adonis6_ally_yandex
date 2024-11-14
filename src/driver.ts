/*
|--------------------------------------------------------------------------
| Ally Yandex Oauth driver
|--------------------------------------------------------------------------
|
| This is an Ally Oauth driver for authenticating users via Yandex.
|
*/

import { Oauth2Driver } from '@adonisjs/ally'
import type { HttpContext } from '@adonisjs/core/http'
import type { AllyDriverContract, AllyUserContract, ApiRequestContract } from '@adonisjs/ally/types'

/**
 *
 * Access token returned by your driver implementation. An access
 * token must have "token" and "type" properties and you may
 * define additional properties (if needed)
 */

export type YandexDriverAccessToken = {
  token: string
  type: 'bearer'

  // Additional properties
  avatar_id: string
  birthday: string
  display_name: string
  email: string
  exp: number
  gender: string
  login: string
  name: string
  id: number
}

/**
 * Shape of the user returned by the Yandex driver implementation.
 */
export type YandexResponse = {
  first_name: string
  last_name: string
  display_name: string
  emails: string[]
  default_email: string
  default_phone: {
    id: number
    number: string
  }
  real_name: string
  is_avatar_empty: boolean
  birthday: string
  default_avatar_id: string
  login: string
  old_social: string
  sex: string
  id: string
  client_id: string
  psuid: string
}

/**
 * Scopes accepted by the driver implementation.
 */
export type YandexDriverScopes =
  | 'login:avatar'
  | 'login:birthday'
  | 'login:email'
  | 'login:info'
  | 'login:default_phone'

/**
 * The configuration accepted by the driver implementation.
 */
export type YandexDriverConfig = {
  driver: 'yandex'
  clientId: string
  clientSecret: string
  callbackUrl: string
  authorizeUrl?: string
  accessTokenUrl?: string
  userInfoUrl?: string

  display_name_as_default?: boolean
}

/**
 * Driver implementation. It is mostly configuration driven except the API call
 * to get user info.
 */
export class YandexDriver
  extends Oauth2Driver<YandexDriverAccessToken, YandexDriverScopes>
  implements AllyDriverContract<YandexDriverAccessToken, YandexDriverScopes>
{
  /**
   * The URL for the redirect request. The user will be redirected on this page
   * to authorize the request.
   *
   * Do not define query strings in this URL.
   */
  protected authorizeUrl = 'https://oauth.yandex.ru/authorize'

  /**
   * The URL to hit to exchange the authorization code for the access token
   *
   * Do not define query strings in this URL.
   */
  protected accessTokenUrl = 'https://oauth.yandex.ru/token'

  /**
   * The URL to hit to get the user details
   *
   * Do not define query strings in this URL.
   */
  protected userInfoUrl = 'https://login.yandex.ru/info'

  /**
   * The param name for the authorization code. Read the documentation of your oauth
   * provider and update the param name to match the query string field name in
   * which the oauth provider sends the authorization_code post redirect.
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error. Read the documentation of your oauth provider and update
   * the param name to match the query string field name in which the oauth provider sends
   * the error post redirect
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the CSRF token. Make sure it is always unique. So a better
   * approach is to prefix the oauth provider name to `oauth_state` value. For example:
   * For example: "facebook_oauth_state"
   */
  protected stateCookieName = 'YandexDriver_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state from.
   * Read the documentation of your oauth provider and update the param
   * name to match the query string used by the provider for exchanging
   * the state.
   */
  protected stateParamName = 'state'

  /**
   * Parameter name for sending the scopes to the oauth provider.
   */
  protected scopeParamName = 'scope'

  /**
   * The separator indentifier for defining multiple scopes
   */
  protected scopesSeparator = ' '

  constructor(
    ctx: HttpContext,
    public config: YandexDriverConfig
  ) {
    super(ctx, config)

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request.
     *
     * DO NOT REMOVE THE FOLLOWING LINE
     */
    this.loadState()
  }

  /**
   * Optionally configure the authorization redirect request. The actual request
   * is made by the base implementation of "Oauth2" driver and this is a
   * hook to pre-configure the request.
   */
  // protected configureRedirectRequest(request: RedirectRequest<YandexDriverScopes>) {}

  /**
   * Optionally configure the access token request. The actual request is made by
   * the base implementation of "Oauth2" driver and this is a hook to pre-configure
   * the request
   */
  // protected configureAccessTokenRequest(request: ApiRequest) {}

  /**
   * Update the implementation to tell if the error received during redirect
   * means "ACCESS DENIED".
   */
  accessDenied() {
    return this.ctx.request.input('error') === 'user_denied'
  }

  /**
   * Get the user details by query the provider API. This method must return
   * the access token and the user details both. Checkout the google
   * implementation for same.
   *
   * https://github.com/adonisjs/ally/blob/develop/src/Drivers/Google/index.ts#L191-L199
   */
  async user(
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<YandexDriverAccessToken>> {
    const accessToken = await this.accessToken()
    const userInfoUrl = this.config.userInfoUrl || this.userInfoUrl
    const request = this.makeHttpRequest(userInfoUrl, accessToken.token)

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if needed)
     */
    if (typeof callback === 'function') {
      callback(request)
    }

    const userInfo = await request.get()
    return {
      ...this.makeGetUserInfo(userInfo),
      token: accessToken,
    }
  }

  async userFromToken(
    accessToken: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>> {
    const userInfoUrl = this.config.userInfoUrl || this.userInfoUrl
    const userInfoRequest = this.httpClient(userInfoUrl)

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if needed)
     */
    if (typeof callback === 'function') {
      callback(userInfoRequest)
    }

    const userInfo: YandexResponse = await userInfoRequest.get()
    return {
      ...this.makeGetUserInfo(userInfo),
      token: {
        token: accessToken,
        type: 'bearer',
      },
    }
  }

  protected makeHttpRequest(token: string, url: string) {
    return this.httpClient(url)
      .header('Authorization', `OAuth ${token}`)
      .header('Accept', 'application/json')
      .param('format', 'json')
      .parseAs('json')
  }

  protected makeGetUserInfo(userInfo: YandexResponse) {
    return {
      id: userInfo.id,
      name: userInfo.real_name,
      email: userInfo.default_email,
      nickName: userInfo.login,
      emailVerificationState: 'unsupported' as const,
      avatarUrl: !userInfo.is_avatar_empty
        ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`
        : null,
      original: userInfo,
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
