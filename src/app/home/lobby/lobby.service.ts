import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonService } from '../../common.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor(private httpClient: HttpClient,  private commonService: CommonService) { }

  getWaitlistPos(place_id: any, wait_id: any){
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type','application/json');

    const params = { 'place_id': place_id, 'wait_id': wait_id};
    
    return  this.httpClient.post(this.commonService.base_url + '/getWaitlistPos', params, {headers: httpHeaders});
  }

  getPlaceName(place_id: any){
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type','application/json');
    const params = { 'place_id': place_id};
    return  this.httpClient.post(this.commonService.base_url + '/getPlaceName', params, {headers: httpHeaders});
  }

  fetchWaitingNumber(baseUrl, place_id, wait_id){
    return fetch(baseUrl + '/getWaitlistPos?place_id='+place_id+'&wait_id='+wait_id,{
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
  }

  isServed(place_id, wait_id){
    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type','application/json');
    const params = { 'place_id': place_id, 'wait_id': wait_id};
    return  this.httpClient.post(this.commonService.base_url + '/isServed', params, {headers: httpHeaders});
  }
}
