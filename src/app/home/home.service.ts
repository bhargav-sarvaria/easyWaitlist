import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  users = [
    // {name:'Bhargav', people: 5, mobile_no: 9820082644, note:''},
    // {name:'Rahul Sonawala', people: 5, mobile_no: 9833163424, note:'Yaha par hae note'},
    // {name:'Divya Kamdar', people: 3, mobile_no: 9869763002, note:''}
  ]
  place_id: any;

  constructor(private httpClient: HttpClient,  private commonService: CommonService) { 
    this.place_id = this.commonService.getCookie('place_id');
  }

  logout(){
    this.commonService.deleteCookie('globals');
    this.commonService.deleteCookie('place_id');
  }

  getWaitlist(){
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type','application/json');

    const params = { place_id: this.place_id};
    
    return  this.httpClient.post(this.commonService.base_url + '/getWaitlist?place_id='+this.place_id, [], {headers: httpHeaders});
  }

  setWaitlist(users, flag){

    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type','application/json');
    const params = { 'place_id': this.place_id, 'users': users, 'flag': flag };
    if(flag && users.length>0){
      params['wait_id'] = users[users.length - 1]['wait_id']
    }
    
    return  this.httpClient.post(this.commonService.base_url + '/setWaitlist', params, {headers: httpHeaders});
  }
}
