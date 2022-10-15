import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonService } from '../../common.service';

@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {}

  getWaitlistPos(place_id: any, wait_id: any) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');

    const params = { place_id: place_id, wait_id: wait_id };

    return this.httpClient.post(
      'http://localhost:8080/api/getWaitlistPos',
      params,
      { headers: httpHeaders }
    );
  }

  getPlaceName(place_id: any) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    const params = { place_id: place_id };
    return this.httpClient.post(
      'http://localhost:8080/api/getPlaceName',
      params,
      { headers: httpHeaders }
    );
  }

  fetchWaitingNumber(place_id, wait_id) {
    return fetch(
      'http://localhost:8080/api/getWaitlistPos?place_id=' + place_id,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  isServed(place_id, wait_id) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    const params = { place_id: place_id, wait_id: wait_id };
    return this.httpClient.post('http://localhost:8080/api/isServed', params, {
      headers: httpHeaders,
    });
  }

  updatePushKeys(place_id, place_name, wait_id, body_data) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    const params = {
      place_id: place_id,
      place_name: place_name,
      wait_id: wait_id,
      credential: body_data,
    };
    return this.httpClient.post(
      'http://localhost:8080/api/updatePushKeys',
      params,
      { headers: httpHeaders }
    );
  }

  notificationPermission(place_id, wait_id) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');

    return this.httpClient.get(
      'http://localhost:8080/api/checkNotificationPermission?wait_id=' +
        wait_id +
        '&place_id=' +
        place_id,
      { headers: httpHeaders }
    );
  }
}
