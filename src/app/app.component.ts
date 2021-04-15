import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {Router} from "@angular/router";
import {SwUpdate} from "@angular/service-worker";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'easyWaitlist';

  constructor(private cookieService: CookieService, private router: Router, updates: SwUpdate) { 
    updates.available.subscribe(event => {
      updates.activateUpdate().then(() => document.location.reload());
    });
  }

  ngOnInit(): void {

    // uncomment to make Login Compulsory
    try {
      var x = JSON.parse(this.cookieService.get('globals'));
      var place_id = this.cookieService.get('place_id');

      if(!(x.hasOwnProperty('currentUser') && x['currentUser'].hasOwnProperty('authdata'))){
        this.router.navigate(['login']);
      } else if(place_id!= null && place_id!=''){
        this.router.navigate(['home/'+place_id]);
      }
    }
    catch(e){
      this.router.navigate(['login']);
      console.log(e)
    }
  }
}
