import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  api: string;
  domain: string;
  constructor(private cookieService: CookieService) {
    // this.api = "http://192.168.0.112:5000";
    // this.api = "https://easy-waitlist-backend.herokuapp.com";
    this.api = 'http://localhost:8080';

    // this.domain = "https://easy--waitlist.herokuapp.com";
    this.domain = 'http://localhost:4200';
    // this.domain = "http://127.0.0.1:8080";
  }

  setCookie(key, value) {
    this.cookieService.set(key, value, { expires: 7, sameSite: 'Lax' });
  }

  getCookie(key) {
    return this.cookieService.get(key);
  }

  deleteCookie(key) {
    this.cookieService.delete(key);
  }

  getAllCookies() {
    return this.cookieService.getAll();
  }
}
