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
  showUi: boolean;
  name: any;
  baseUrl: string;
  showProgressBar: boolean;
  x: any;

  constructor(private lobbyService: LobbyService, public commonService: CommonService, private acticatedRoute: ActivatedRoute) { 
      
      this.baseUrl = this.commonService.base_url;

      this.showProgressBar = true;
      this.showUi = false;

      this.acticatedRoute.params.subscribe(data => {
        this.place_id = data.place_id;
        this.acticatedRoute.queryParams.subscribe(params => {
          this.wait_id = params['wid'];
          this.startLiveUpdate();
          
          this.x = setInterval(()=> {this.startLiveUpdate();}, 45000 )
        });
      });   
  }

  ngOnInit(): void {

    // setInterval( function(){this.startLiveUpdate(this.base_url)} , 5000);
    // this.startLiveUpdate();

    // this.showProgressBar = true;
    // this.lobbyService.getWaitlistPos(this.place_id, this.wait_id)
    // .subscribe(response=>{
    //   console.log('Get waitlist pos reponse');
    //   console.log(response);
    //   if(response.hasOwnProperty('success') && response['success']) {
    //     for (let [index, value] of JSON.parse(response['data']).entries()) {
    //       if(value['wait_id'].toString() === this.wait_id){
    //         this.waiting_no = index + 1;
    //         this.name = value['name'];
    //         this.disableUi = false;
    //         break;
    //       }
    //       this.disableUi = true;
    //     }
    //   } else {
    //       this.disableUi = true;
    //   }
    //   this.showProgressBar = false;
    // }, error=>{
    //   this.disableUi = true;
    //   this.showProgressBar = false;
    //   console.log(error);
    // });

    
  }

  startLiveUpdate(){
    
    fetch(this.baseUrl + '/getWaitlistPos?place_id='+this.place_id+'&wait_id='+this.wait_id,{
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
      }).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong');
        }
      }).then((responseJson) => {
        console.log('Get waitlist pos reponse');
        console.log(responseJson);
        if(responseJson.hasOwnProperty('success') && responseJson['success']) {
          var waitings = JSON.parse(responseJson['data']);
          if(waitings.length > 0 ){
            for (let [index, value] of waitings.entries()) {
              if(value['wait_id'].toString() === this.wait_id){
                this.waiting_no = index + 1;
                this.name = value['name'];
                this.disableUi = false;
                this.showUi = true;
                break;
              }
              this.disableUi = true;
              this.showUi = true;
            }
          }else{
            this.disableUi = true;
            this.showUi = true;
          }
        } else {
            this.disableUi = true;
            this.showUi = true;
        }
        this.showProgressBar = false;

      }).catch((error) => {
        this.disableUi = true;
        this.showUi = true;
        this.showProgressBar = false;
        console.log(error);
      });
  }
}
