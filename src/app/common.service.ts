import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  base_url: string;
  constructor(private cookieService: CookieService) {
    this.base_url = "http://192.168.0.112:5000";
    // this.base_url = "http://localhost:9000";
   }

   setCookie(key, value){
    this.cookieService.set(key, value);
  }

  getCookie(key){
    return this.cookieService.get(key);
  }

  deleteCookie(key){
    this.cookieService.delete(key);
  }
}

