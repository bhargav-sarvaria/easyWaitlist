import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  globals = null;
  
  constructor(private httpClient: HttpClient, private commonService: CommonService) { 
  }

  register(name: string, mobile_no: string, email: string, password: string){

    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type','application/json');

    const params = { name: name, mobile_no: mobile_no, email: email, password: password};
    console.log(params);

    return  this.httpClient.post(this.commonService.base_url + '/register', params, {headers: httpHeaders});
  }
  
  checkLogin(email: string, password: string){

    const httpHeaders = new HttpHeaders();
    httpHeaders.append('content-type','application/json');

    const params = { email: email, password: password};
    
    return  this.httpClient.post(this.commonService.base_url + '/login', params, {headers: httpHeaders});
  }

  SetCredentials(username, password) {
    var authdata = this.encode(username + ':' + password);

    this.globals = {
        currentUser: {
            username: username,
            authdata: authdata
        }
    };

    // $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
    
    this.commonService.setCookie('globals', JSON.stringify(this.globals));
  };

  ClearCredentials() {
      this.globals = null;
      this.commonService.deleteCookie('globals');
      // $http.defaults.headers.common.Authorization = 'Basic ';
  };

  encode(input: String){

    var output = '';
    var chr1, chr2, chr3:  any;
    var enc1, enc2, enc3, enc4: any;
    var i = 0;

    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
            this.keyStr.charAt(enc1) +
            this.keyStr.charAt(enc2) +
            this.keyStr.charAt(enc3) +
            this.keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
  } 
}
