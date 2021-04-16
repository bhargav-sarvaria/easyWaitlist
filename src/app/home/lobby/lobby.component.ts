import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyService } from './lobby.service';
import { SwUpdate, SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  place_id: any;
  placeName: string = null;
  wait_id: any;
  waiting_no: any;
  waitTimeOver: true;
  name: any;

  disableUi:  boolean;
  showUi: boolean;
  showProgressBar: boolean;
  isNotificationEnabled: boolean = false;
  isNotificationBlocked: boolean = false;
  x: any;
  private readonly publicKey = 'BPi3By2R0nFqzVlxVOOjym-co_hFY2QuOzT41mP_NTYchfVpyN1Z4FANRXy5XpTYJ6dfSaS2BfPvx_lwvfL3u4s';

  constructor(
    private lobbyService: LobbyService,
    public commonService: CommonService,
    private acticatedRoute: ActivatedRoute,
    private updates: SwUpdate,
    private swPush: SwPush
  ) { 

      updates.available.subscribe(event => {
        updates.activateUpdate().then(() => document.location.reload());
      });
      
      this.x = null;
      this.showProgressBar = true;
      this.showUi = false;

      this.acticatedRoute.params.subscribe(data => {
        this.place_id = data.place_id;
        this.acticatedRoute.queryParams.subscribe(params => {
          this.wait_id = params['wid'];
          
          this.showProgressBar = true;

          this.lobbyService.getPlaceName(this.place_id).subscribe(response=>{
            console.log('Get Place Name');
            console.log(response);
            this.showProgressBar = false;
            if(response.hasOwnProperty('success') && response['success']) {
              this.placeName = response['place_name'];
              this.startLiveUpdate();
              this.x = setInterval(()=> {this.startLiveUpdate();}, 5000 )
            } 
          }, error=>{
            this.showProgressBar = false;
            console.log(error);
          });
        });
      });   
  }

  ngOnInit(): void {
  }

  pushSubscription(){
    console.log('Sw Notitication Enabled is: ' +this.swPush.isEnabled);
    console.log('Sw Notitication Subscription is: ' + JSON.stringify(this.swPush.subscription));

    if(!this.swPush.isEnabled){
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.publicKey
    }).then(sub => {
      console.log('Got sub');
  
      this.isNotificationEnabled = true;
      this.isNotificationBlocked = false;
      this.lobbyService.updatePushKeys(this.place_id, this.placeName, this.wait_id, sub).subscribe(response=>{
        console.log('Set credential response: ' + JSON.stringify(response))      
      }, error=>{ console.log(error) });

    }).catch(err => {
      console.log('Notification Request error'+ err);
      console.log(String(typeof(err)));
      console.log(err.toString().includes('denied'));
      if( err.toString().includes('denied') ){
        this.isNotificationBlocked = true;
        this.isNotificationEnabled = false;
      }
    });
  }

  isServed(){
    this.showProgressBar = true;
    this.lobbyService.isServed(this.place_id, this.wait_id).subscribe(response=>{
      console.log('Is Served');
      console.log(response);
      this.showProgressBar = false;
      if(response.hasOwnProperty('success') && response['success']) {
        if(response['is_served']){
          this.showUi = true;
          this.waitTimeOver = true;
        }else{
          this.disableUi = true;
          this.showUi = true;
        }
        
      } 
    }, error=>{
      this.showProgressBar = false;
      this.disableUi = true;
      this.showUi = true;
      console.log(error);
    });
  }

  startLiveUpdate(){
      
      this.lobbyService.fetchWaitingNumber(this.place_id, this.wait_id).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong');
        }
      }).then((responseJson) => {
        console.log('Get waitlist pos reponse');
        console.log(responseJson);
        if(responseJson.hasOwnProperty('success') && responseJson['success']) {
          var waitings = responseJson['data'];
          var present = false;
          if(waitings.length > 0 ){
            for (let [index, value] of waitings.entries()) {
              if(value['wait_id'].toString() === this.wait_id){
                this.waiting_no = index + 1;
                this.name = value['name'];
                this.disableUi = false;
                this.showUi = true;
                var present = true;
                break;
              }
            }
          }
          
          if(!present){
            if(this.x != null){
              clearInterval(this.x);
            }
            this.isServed();
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
