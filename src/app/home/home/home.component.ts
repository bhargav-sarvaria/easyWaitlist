import { Component, OnInit } from '@angular/core';

import {HomeService} from '../home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddUserComponent } from '../add-user/add-user.component';
import { CommonService } from '../../common.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  users: any;
  recentlyDeleted: {};
  majorError: boolean = false;
  errorUi: boolean;
  noUsers: boolean;
  disableUi: boolean;
  disableUndo: boolean;
  place_id: any;
  showProgressBar: boolean;
  openedSnackbar: any;

  cards: any;
  targetBCR: any;
  target: any;
  startX: any;
  currentX: any;
  screenX: any;
  targetX: any; 
  draggingCard: boolean;

  paramQuery: any;

  constructor(public homeService: HomeService, private activatedRoute: ActivatedRoute, public addUserDialog: MatDialog, public router: Router,
    private commonService: CommonService, private snackaBar: MatSnackBar, updates: SwUpdate) {
    
    updates.available.subscribe(event => {
      updates.activateUpdate().then(() => document.location.reload());
    });
      
    activatedRoute.queryParams.subscribe(queryParams => {
      console.log(queryParams.toString());
      if(queryParams.hasOwnProperty('from_login') && queryParams['from_login']){
        window.location.href = this.commonService.domain + '/home';
      }
    });

    this.disableUndo = true;
    this.errorUi = false;
    this.showProgressBar = false;
    this.place_id = this.commonService.getCookie('place_id');
    this.setUsers(null);

  }

  openSnackbar(message, action){
    this.openedSnackbar = this.snackaBar.open(message, action, {duration: 2000});
    this.openedSnackbar.onAction().subscribe(()=>{
      if(action == 'Undo'){
        this.undo();
      }
    })
  }

  setUsers(snackabar: any){
    this.showProgressBar = true;
    this.disableUi = true;
    this.homeService.getWaitlist()
    .subscribe(response=>{
      this.majorError = false;
      var resp = response['body']
      console.log('Get waitlist reponse');
      console.log(resp);
      if(resp.hasOwnProperty('success') && resp['success']) {
        this.users = JSON.parse(resp['data']);
        if(this.users.length > 0){
          this.noUsers = false;
        }else{
          this.noUsers = true;
        }

        setTimeout(() => {
          this.cards = Array.from(document.querySelectorAll('.example-card'));

          this.onStart = this.onStart.bind(this);
          this.onMove = this.onMove.bind(this);
          this.onEnd = this.onEnd.bind(this);
          this.update = this.update.bind(this);
          this.targetBCR, this.target = null;
          this.startX, this.currentX,this.screenX,this.targetX = 0;
          this.draggingCard = false;
          
          requestAnimationFrame(this.update);
          this.addEventListeners();
          this.disableUi = false;
          this.showProgressBar = false;

          if(snackabar!= null){
            this.openSnackbar(snackabar['message'], snackabar['action']);
          }
        },1000);        

      } else {
          this.showProgressBar = false;
      }
    }, error=>{
      this.showProgressBar = false;
      this.majorError = true;
      console.log(error);
    });
    
  }

  ngOnInit(): void {
    window.addEventListener('load', () => this.setUsers(null));
  }
  openDialog() {
    if(this.openedSnackbar){this.openedSnackbar.dismiss();}
    
    let  dialogRef = this.addUserDialog.open(AddUserComponent, {
      width: '75%',
      data: this.users,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if(result.name != ''){
          result['wait_id'] = new Date().getTime();
          result['position'] = this.users.length + 1;
          this.users.splice(this.users.length, 0, result);

          this.disableUi = true;
          this.showProgressBar = true;
          var type = 'Add';

          this.homeService.setWaitlist(this.users, true, type, this.users[this.users.length - 1])
          .subscribe(response=>{
            console.log('Add user Set waitlist');
            console.log(response);
            if(response.hasOwnProperty('success') && response['success']) {
              this.errorUi = false;
              this.recentlyDeleted = {};
              this.disableUndo = true;
              var snackbar = {message: result['name']+' added on the waitlist',  action:'Dismiss'};
              setTimeout(() => {this.setUsers(snackbar)},500);
            }
          }, error=>{
            this.showProgressBar = false;
            this.errorUi = true;
            setTimeout(() => {this.setUsers(null)},500);
            console.log(error);
          });

        }
      }
    )

  }

  logout(){
    if(this.openedSnackbar){this.openedSnackbar.dismiss();}
    this.homeService.logout();
    this.router.navigate(['login']);
  }

  removeUser(i){
    if(this.openedSnackbar){this.openedSnackbar.dismiss();}
    
    let x = document.getElementsByClassName('example-card');
    this.targetBCR = x[i].getBoundingClientRect();
    x[i].parentNode.removeChild(x[i]);

    const targetIndex = i;
    this.animateOtherCardsIntoPosition(targetIndex);
    
    this.cards.splice(targetIndex, 1);
    // this.users.splice(targetIndex, 1);

    this.recentlyDeleted = {index: targetIndex,  user: this.users.splice(targetIndex, 1)};
    this.disableUndo = false;

    this.disableUi = true;
    this.showProgressBar = true;
    var type = 'Remove';

    this.homeService.setWaitlist(this.users, false, type, this.recentlyDeleted['user'][0])
    .subscribe(response=>{
      console.log('Remove User Set Waitlist');
      console.log(response);
      if(response.hasOwnProperty('success') && response['success']) {
        this.errorUi = false;
        var snackbar = {message: this.recentlyDeleted['user'][0]['name'] + ' removed from the waitlist',  action: 'Undo'};
        setTimeout(() => {this.setUsers(snackbar)},500);
      }
    }, error=>{
      this.showProgressBar = false;
      setTimeout(() => {this.setUsers(null)},500);
      this.errorUi = true;
      console.log(error);
    });
    
  }

  addEventListeners() {
    
    document.addEventListener('touchstart', this.onStart, {passive: false});
    document.addEventListener('touchmove', this.onMove, {passive: false});
    document.addEventListener('touchend', this.onEnd, {passive: false});

    document.addEventListener('mousedown', this.onStart, {passive: false});
    document.addEventListener('mousemove', this.onMove, {passive: false});
    document.addEventListener('mouseup', this.onEnd, {passive: false});
  }

  onStart(evt) {
    if (this.target)
      return;

    if (!evt.target.classList.contains('example-card'))
      return;

    this.target = evt.target;
    this.targetBCR = this.target.getBoundingClientRect();

    if(evt.touches && evt.touches.length > 0){
      this.startX = evt.pageX || evt.touches[0].pageX;
    }else{
      this.startX = evt.pageX;
    }
    
    this.currentX = this.startX;

    this.draggingCard = true;
    this.target.style.willChange = 'transform';

    evt.preventDefault();
  }

  onMove(evt) {
    if (!this.target)
      return;
    
    if(evt.touches && evt.touches.length > 0){
      this.currentX = evt.pageX || evt.touches[0].pageX;
    }else{
      this.currentX = evt.pageX;
    }
  }

  onEnd(evt) {
    if (!this.target)
      return;

    this.targetX = 0;
    let screenX = this.currentX - this.startX;
    if (Math.abs(screenX) > this.targetBCR.width * 0.35) {
      this.targetX = (screenX > 0) ? this.targetBCR.width : -this.targetBCR.width;
    }

    this.draggingCard = false;
  }


  update() {

    requestAnimationFrame(this.update);

    if (!this.target)
      return;

    if (this.draggingCard) {
      this.screenX = this.currentX - this.startX;
    } else {
      this.screenX += (this.targetX - this.screenX) / 4;
    }

    const normalizedDragDistance =
      (Math.abs(this.screenX) / this.targetBCR.width);
    const opacity = 1 - Math.pow(normalizedDragDistance, 3);

    this.target.style.transform = `translateX(${this.screenX}px)`;
    this.target.style.opacity = opacity;

    // User has finished dragging.
    if (this.draggingCard)
      return;

    const isNearlyAtStart = (Math.abs(this.screenX) < 0.1);
    const isNearlyInvisible = (opacity < 0.01);

    // If the card is nearly gone.
    if (isNearlyInvisible) {
      if(this.openedSnackbar){this.openedSnackbar.dismiss();}

      // Bail if there's no target or it's not attached to a parent anymore.
      if (!this.target || !this.target.parentNode)
        return;

      this.target.parentNode.removeChild(this.target);      

      const targetIndex = this.cards.indexOf(this.target);
      this.animateOtherCardsIntoPosition(targetIndex);
      
      this.cards.splice(targetIndex, 1);
      // this.users.splice(targetIndex, 1);

      this.recentlyDeleted = {index: targetIndex,  user: this.users.splice(targetIndex, 1)};
      this.disableUndo = false;

      this.disableUi = true;
      this.showProgressBar = true;
      var type = 'Remove';

      this.homeService.setWaitlist(this.users, false, type, this.recentlyDeleted['user'][0])
      .subscribe(response=>{
        console.log('Slide remove user set waitlist');
        console.log(response);
        if(response.hasOwnProperty('success') && response['success']) {
          this.errorUi = false;
          var snackbar = {message: this.recentlyDeleted['user'][0]['name'] + ' removed from the waitlist',  action:'Undo'};
          setTimeout(() => {this.setUsers(snackbar)},500);
        }
      }, error=>{
        this.showProgressBar = false;
        setTimeout(() => {this.setUsers(null)},500);
        this.errorUi = true;
        console.log(error);
      });

      // Slide all the other cards.
    } else if (isNearlyAtStart) {
      this.resetTarget();
    }
  }

  undo(){
    this.noUsers = false;
    if(this.openedSnackbar){this.openedSnackbar.dismiss();}

    if(Object.keys(this.recentlyDeleted).length >  0){
      // this.cards.splice(this.recentlyDeleted['index'], 0, this.recentlyDeleted['card'][0]);
      this.users.splice(this.recentlyDeleted['index'], 0, this.recentlyDeleted['user'][0]);
      var name = this.recentlyDeleted['user'][0]['name'];

      this.disableUi = true;
      this.showProgressBar = true;
      var type = 'Undo';

      this.homeService.setWaitlist(this.users, false, type, this.recentlyDeleted['user'][0])
      .subscribe(response=>{
        console.log('Undo user set waitlist');
        console.log(response);
        if(response.hasOwnProperty('success') && response['success']) {
          
          this.errorUi = false;
          this.animateOtherCardsOuttoPosition(this.recentlyDeleted['index']);
          this.recentlyDeleted = {};
          this.disableUndo = true;
          
          var snackbar = {message: name + ' added back to the waitlist',  action:'Dismiss'};
          setTimeout(() => {this.setUsers(snackbar)},500);
        } 
      }, error=>{
        this.showProgressBar = false;
        setTimeout(() => {this.setUsers(null)},500);
        this.errorUi = true;
        console.log(error);
      });

    }
  }

  animateOtherCardsOuttoPosition(startIndex) {
    // If removed card was the last one, there is nothing to animate. Remove target.
    if (startIndex === 0) {
      this.resetTarget();
      return;
    }

    const frames = [{
      transform: `translateY(${-this.targetBCR.height + 20}px)`
    }, {
      transform: 'none'
    }];
    const options = {
      easing: 'cubic-bezier(0,0,0.31,1)',
      duration: 150
    };
    const onAnimationComplete = () => this.resetTarget();

    for (let i = startIndex; i < this.cards.length; i++) {
      const card = this.cards[i];

      // Move the card down then slide it up.
      card
        .animate(frames, options)
        .addEventListener('finish', onAnimationComplete);
    }
  }

  animateOtherCardsIntoPosition(startIndex) {
    // If removed card was the last one, there is nothing to animate. Remove target.
    if (startIndex === this.cards.length) {
      this.resetTarget();
      return;
    }

    const frames = [{
      transform: `translateY(${this.targetBCR.height + 20}px)`
    }, {
      transform: 'none'
    }];
    const options = {
      easing: 'cubic-bezier(0,0,0.31,1)',
      duration: 150
    };
    const onAnimationComplete = () => this.resetTarget();

    for (let i = startIndex; i < this.cards.length; i++) {
      const card = this.cards[i];

      // Move the card down then slide it up.
      card
        .animate(frames, options)
        .addEventListener('finish', onAnimationComplete);
    }
  }

  resetTarget() {
    if (!this.target)
      return;

    this.target.style.willChange = 'initial';
    this.target.style.transform = 'none';
    this.target = null;
  }
}