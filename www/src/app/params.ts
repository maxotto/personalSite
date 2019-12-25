import { isDevMode } from '@angular/core'

export const GlobalParams = Object.freeze({
  API_SUBDOMEN: 'api',
  API_VERSION: 'v1',
  // TODO ThingSpeak setting move to separated JSON file
  THINGSPEAK_API_READ_KEY: 'YODZIINAR4YEPRY5',
  THINGSPEAK_API_TIMESCALE: 10,
  THINGSPEAK_API_DAYS: 5,
})

export const coreUrls = _window => {
  let hostname = _window.location.hostname.replace(/^(www\.)/, '')
  if (isDevMode()) {
    hostname = 'agmsite.com'
  }
  const apiURL = `${GlobalParams.API_SUBDOMEN}.${hostname}`
  const apiRoot =
    '/' + GlobalParams.API_VERSION + '/' + GlobalParams.API_SUBDOMEN
  return Object.freeze({
    protocol: _window.location.protocol,
    hostname: hostname,
    apiURL: apiURL,
    apiRoot: apiRoot,
    noTokenUrls: [hostname + `/` + apiRoot + `/login`, 'api.thingspeak.com/'],
  })
}
