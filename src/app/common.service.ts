import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  base_url: string;
  domain: string;
  constructor(private cookieService: CookieService) {
    // this.base_url = "http://192.168.0.112:5000";
    this.base_url = "https://easy-waitlist-backend.herokuapp.com";
    // this.base_url = "http://localhost:9000";

    this.domain = "https://easywaitlist.herokuapp.com";
    // this.domain = "http://localhost:4200";
    // this.domain = "http://127.0.0.1:8080";
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

