import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyService } from './lobby.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  place_id: any;
  wait_id: any;
  waiting_no: any;
  disableUi:  boolean;
  name: any;

  constructor(private lobbyService: LobbyService, private commonService: CommonService, private acticatedRoute: ActivatedRoute) { 
    
      this.disableUi = true;
      this.acticatedRoute.params.subscribe(data => {
        this.place_id = data.place_id;
      });
      this.acticatedRoute.queryParams.subscribe(params => {
        this.wait_id = params['wid'];
      });
  }

  ngOnInit(): void {
    this.lobbyService.getWaitlistPos(this.place_id, this.wait_id)
    .subscribe(response=>{
      console.log('Get waitlist pos reponse');
      console.log(response);
      if(response.hasOwnProperty('success') && response['success']) {

        // // this.users = response['data'];
        // for (let i of JSON.parse(response['data'])) {
        //   console.log(i); // 1, "string", false

        // }

        for (let [index, value] of JSON.parse(response['data']).entries()) {
          if(value['wait_id'].toString() === this.wait_id){
            this.waiting_no = index + 1;
            this.name = value['name'];
            this.disableUi = false;
            break;
          }
          this.disableUi = true;
        }


        
      } else {
          this.disableUi = true;
      }
    }, error=>{
      console.log(error);
    });
  }

}
