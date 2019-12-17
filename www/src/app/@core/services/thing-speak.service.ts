import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

import { GlobalParams } from '../../params';
import {JwtHelper} from '../jwt/jwtHelper';

@Injectable()
export class ThingSpeakService {
  apiReadKey: string; // Read API key for this specific channel (optional--no key required for public channels)
  results: number; //  Number of entries to retrieve, 8000 max (optional)
  days: number; // Number of 24-hour periods before now to include in feed, default 1 (optional)
  start: string; //  Start date in format YYYY-MM-DD%20HH:NN:SS (optional)
  end: string; // End date in format YYYY-MM-DD%20HH:NN:SS (optional)
  timezone: string; // Identifier from Time Zones Reference for this request (optional)
  offset: number; // Timezone offset that results are displayed in. Use the timezone parameter for greater accuracy. (optional)
  status: boolean; // (true/false) Include status updates in feed by setting "status=true" (optional)
  metadata: boolean; // (true/false) Include metadata for a channel by setting "metadata=true" (optional)
  location: boolean; // (true/false) Include latitude, longitude, and elevation in feed by setting "location=true" (optional)
  min: number; // (decimal) Minimum value to include in response (optional)
  max: number; // (decimal) Maximum value to include in response (optional)
  round: number; // (integer) Round to this many decimal places (optional)
  timescale: number; // (integer or string) Get first value in this many minutes,
  // valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)
  sum: string; // (integer or string) Get sum of this many minutes, valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)
  average: string; // (integer or string) Get average of this many minutes,
  // valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)
  median: string; // (integer or string) Get median of this many minutes,
  // valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)

  callback: string; // (string) Function name to be used for JSONP cross-domain requests (optional)
  constructor(private http: HttpClient) {
    this.apiReadKey = GlobalParams.THINGSPEAK_API_READ_KEY;
  }

  getData(config: ThingSpeakConfig): Observable<any> {
    let Params = new HttpParams();
    for (const paramName of config.paramsList) {
      if (config.hasOwnProperty(paramName)) {
        Params = Params.append(paramName, config[paramName].toString());
      }
    }
    const url = 'https://api.thingspeak.com/channels/204555/feeds.json';
    return this.http.get(url, { params: Params });
  }

}

export class ThingSpeakConfig {
  apiReadKey: string; // Read API key for this specific channel (optional--no key required for public channels)
  results?: number; //  Number of entries to retrieve, 8000 max (optional)
  days?: number; // Number of 24-hour periods before now to include in feed, default 1 (optional)
  start?: string; //  Start date in format YYYY-MM-DD%20HH:NN:SS (optional)
  end?: string; // End date in format YYYY-MM-DD%20HH:NN:SS (optional)
  timezone?: string; // Identifier from Time Zones Reference for this request (optional)
  offset?: number; // Timezone offset that results are displayed in. Use the timezone parameter for greater accuracy. (optional)
  status?: boolean; // (true/false) Include status updates in feed by setting "status=true" (optional)
  metadata?: boolean; // (true/false) Include metadata for a channel by setting "metadata=true" (optional)
  location?: boolean; // (true/false) Include latitude, longitude, and elevation in feed by setting "location=true" (optional)
  min?: number; // (decimal) Minimum value to include in response (optional)
  max?: number; // (decimal) Maximum value to include in response (optional)
  round?: number; // (integer) Round to this many decimal places (optional)
  timescale?: number; // (integer or string) Get first value in this many minutes,
  // valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)
  sum?: string; // (integer or string) Get sum of this many minutes, valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)
  average?: string; // (integer or string) Get average of this many minutes,
  // valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)
  median?: string; // (integer or string) Get median of this many minutes,
  // valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)
  paramsList = [];
  constructor() {
  this.paramsList =
    [
      'apiReadKey',
      'results',
      'days',
      'start',
      'end',
      'timezone',
      'offset',
      'status',
      'metadata',
      'location',
      'min',
      'max',
      'round',
      'timescale',
      'sum',
      'average',
      'median'
    ]
  }
}
