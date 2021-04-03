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
  placeName: string;
  wait_id: any;
  waiting_no: any;
  disableUi:  boolean;
  waitTimeOver: true;
  showUi: boolean;
  name: any;
  baseUrl: string;
  showProgressBar: boolean;
  x: any;

  constructor(private lobbyService: LobbyService, public commonService: CommonService, private acticatedRoute: ActivatedRoute) { 
      
      this.baseUrl = this.commonService.base_url;
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
      
      this.lobbyService.fetchWaitingNumber(this.baseUrl, this.place_id, this.wait_id).then((response) => {
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
