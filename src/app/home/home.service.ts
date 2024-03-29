import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  users = [
    // {name:'Bhargav', people: 5, mobile_no: 9820082644, note:''},
    // {name:'Rahul Sonawala', people: 5, mobile_no: 9833163424, note:'Yaha par hae note'},
    // {name:'Divya Kamdar', people: 3, mobile_no: 9869763002, note:''}
  ];
  place_id: any;

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.place_id = this.commonService.getCookie('place_id');
  }

  logout() {
    this.commonService.deleteCookie('globals');
    this.commonService.deleteCookie('place_id');
    this.commonService.deleteCookie('place_name');
  }

  checkConnectivity() {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');

    return this.httpClient.get(this.commonService.api + '/checkConnectivity', {
      headers: httpHeaders,
    });
  }

  getWaitlist() {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');

    return this.httpClient.get(
      'http://localhost:8080/api/getWaitlist?place_id=' + this.place_id,
      { headers: httpHeaders }
    );
  }

  setWaitlist(users, flag, addUser, user) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    const params = {
      place_id: this.place_id,
      users: users,
      flag: flag,
      request_type: addUser,
      user: user,
    };

    return this.httpClient.post(
      'http://localhost:8080/api/setWaitlist',
      params,
      { headers: httpHeaders }
    );
  }

  notifyUser(place_id, wait_id) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    const params = { place_id: place_id, wait_id: wait_id };

    return this.httpClient.post(
      'http://localhost:8080/api/sendNotification',
      params,
      {
        headers: httpHeaders,
      }
    );
  }

  messageUser(place_id, wait_id, place_name) {
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type', 'application/json');
    const params = {
      place_id: place_id,
      wait_id: wait_id,
      place_name: place_name,
    };

    return this.httpClient.post(
      'http://localhost:8080/api/sendMessage',
      params,
      {
        headers: httpHeaders,
      }
    );
  }
}
