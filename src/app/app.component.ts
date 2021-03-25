import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'myWaitlist';

  constructor(private cookieService: CookieService, private router: Router) { 
  }

  ngOnInit(): void {

    // uncomment to make Login Compulsory
    // console.log('stopper');
    // try {
    //   var x = JSON.parse(this.cookieService.get('globals'));
    //   var place_id = this.cookieService.get('place_id');

    //   if(!(x.hasOwnProperty('currentUser') && x['currentUser'].hasOwnProperty('authdata'))){
    //     this.router.navigate(['login']);
    //   } else if(place_id!= null && place_id!=''){
    //     this.router.navigate(['home/'+place_id]);
    //   }
    // }
    // catch(e){
    //   this.router.navigate(['login']);
    //   console.log(e)
    // }
  }
}
