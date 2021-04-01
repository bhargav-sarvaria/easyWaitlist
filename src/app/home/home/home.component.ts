import { Component, OnInit } from '@angular/core';

import {HomeService} from '../home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog'; 
import { AddUserComponent } from '../add-user/add-user.component';
import { CommonService } from '../../common.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  users: any;
  recentlyDeleted: {};
  disableUi: boolean;
  disableUndo: boolean;
  place_id: any;
  showProgressBar: boolean;

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
    private commonService: CommonService) { 
      activatedRoute.queryParams.subscribe(queryParams => {
      console.log(queryParams.toString());
      if(queryParams.hasOwnProperty('from_login') && queryParams['from_login']){
        window.location.href = this.commonService.domain + '/home';
      }
    });

    this.disableUndo = true;
    this.showProgressBar = false;
    this.place_id = this.commonService.getCookie('place_id');
    this.setUsers();  

  }

  setUsers(){
    this.showProgressBar = true;
    this.disableUi = true;
    this.homeService.getWaitlist()
    .subscribe(response=>{
      console.log('Get waitlist reponse');
      console.log(response);
      if(response.hasOwnProperty('success') && response['success']) {

        // this.users = response['data'];
        this.users = JSON.parse(response['data']);

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
        },1000);

        
      } else {
          this.users = [];
      }
    }, error=>{
      console.log(error);
    });
    
  }

  ngOnInit(): void {
    window.addEventListener('load', () => this.setUsers());
  }
  openDialog() {
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
          this.homeService.setWaitlist(this.users, true)
          .subscribe(response=>{
            console.log('Add user Set waitlist');
            console.log(response);
            if(response.hasOwnProperty('success') && response['success']) {
              this.recentlyDeleted = {};
              this.disableUndo = true;
              setTimeout(() => {this.setUsers()},500);
            } 
          }, error=>{
            console.log(error);
          });

        }
      }
    )

  }

  logout(){
    this.homeService.logout();
    this.router.navigate(['login']);
  }

  removeUser(i){
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
    this.homeService.setWaitlist(this.users, false)
    .subscribe(response=>{
      console.log('Remove User Set Waitlist');
      console.log(response);
      if(response.hasOwnProperty('success') && response['success']) {
        setTimeout(() => {this.setUsers()},500);
      } 
    }, error=>{
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
      this.homeService.setWaitlist(this.users, false)
      .subscribe(response=>{
        console.log('Slide remove user set waitlist');
        console.log(response);
        if(response.hasOwnProperty('success') && response['success']) {
          setTimeout(() => {this.setUsers()},500);
        }
      }, error=>{
        console.log(error);
      });

      // Slide all the other cards.
    } else if (isNearlyAtStart) {
      this.resetTarget();
    }
  }

  undo(){
    if(Object.keys(this.recentlyDeleted).length >  0){
      // this.cards.splice(this.recentlyDeleted['index'], 0, this.recentlyDeleted['card'][0]);
      this.users.splice(this.recentlyDeleted['index'], 0, this.recentlyDeleted['user'][0]);

      this.disableUi = true;
      this.showProgressBar = true;
      this.homeService.setWaitlist(this.users, false)
      .subscribe(response=>{
        console.log('Undo user set waitlist');
        console.log(response);
        if(response.hasOwnProperty('success') && response['success']) {

          this.animateOtherCardsOuttoPosition(this.recentlyDeleted['index']);
          this.recentlyDeleted = {};
          this.disableUndo = true;
          
          setTimeout(() => {this.setUsers()},500);
        }
      }, error=>{
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

// export class Cards {

//   cards: any;
//   targetBCR: any;
//   target: any;
//   startX: any;
//   currentX: any;
//   screenX: any;
//   targetX: any;
//   draggingCard: boolean;

  

//   constructor() {
//     this.cards = Array.from(document.querySelectorAll('.example-card'));

//     this.onStart = this.onStart.bind(this);
//     this.onMove = this.onMove.bind(this);
//     this.onEnd = this.onEnd.bind(this);
//     this.update = this.update.bind(this);
//     this.targetBCR = null;
//     this.target = null;
//     this.startX = 0;
//     this.currentX = 0;
//     this.screenX = 0;
//     this.targetX = 0;
//     this.draggingCard = false;

//     this.addEventListeners();

//     requestAnimationFrame(this.update);
//   }

//   addEventListeners() {
//     document.addEventListener('touchstart', this.onStart, {passive: false});
//     document.addEventListener('touchmove', this.onMove, {passive: false});
//     document.addEventListener('touchend', this.onEnd, {passive: false});

//     document.addEventListener('mousedown', this.onStart, {passive: false});
//     document.addEventListener('mousemove', this.onMove, {passive: false});
//     document.addEventListener('mouseup', this.onEnd, {passive: false});
//   }

//   onStart(evt) {
//     if (this.target)
//       return;

//     if (!evt.target.classList.contains('example-card'))
//       return;

//     this.target = evt.target;
//     this.targetBCR = this.target.getBoundingClientRect();

//     this.startX = evt.pageX || evt.touches[0].pageX;
//     this.currentX = this.startX;

//     this.draggingCard = true;
//     this.target.style.willChange = 'transform';

//     evt.preventDefault();
//   }

//   onMove(evt) {
//     if (!this.target)
//       return;

//     this.currentX = evt.pageX || evt.touches[0].pageX;
//   }

//   onEnd(evt) {
//     if (!this.target)
//       return;

//     this.targetX = 0;
//     let screenX = this.currentX - this.startX;
//     if (Math.abs(screenX) > this.targetBCR.width * 0.35) {
//       this.targetX = (screenX > 0) ? this.targetBCR.width : -this.targetBCR.width;
//     }

//     this.draggingCard = false;
//   }

//   update() {

//     requestAnimationFrame(this.update);

//     if (!this.target)
//       return;

//     if (this.draggingCard) {
//       this.screenX = this.currentX - this.startX;
//     } else {
//       this.screenX += (this.targetX - this.screenX) / 4;
//     }

//     const normalizedDragDistance =
//       (Math.abs(this.screenX) / this.targetBCR.width);
//     const opacity = 1 - Math.pow(normalizedDragDistance, 3);

//     this.target.style.transform = `translateX(${this.screenX}px)`;
//     this.target.style.opacity = opacity;

//     // User has finished dragging.
//     if (this.draggingCard)
//       return;

//     const isNearlyAtStart = (Math.abs(this.screenX) < 0.1);
//     const isNearlyInvisible = (opacity < 0.01);

//     // If the card is nearly gone.
//     if (isNearlyInvisible) {

//       // Bail if there's no target or it's not attached to a parent anymore.
//       if (!this.target || !this.target.parentNode)
//         return;

//       this.target.parentNode.removeChild(this.target);

//       const targetIndex = this.cards.indexOf(this.target);
//       this.cards.splice(targetIndex, 1);

//       // Slide all the other cards.
//       this.animateOtherCardsIntoPosition(targetIndex);

//     } else if (isNearlyAtStart) {
//       this.resetTarget();
//     }
//   }

//   animateOtherCardsIntoPosition(startIndex) {
//     // If removed card was the last one, there is nothing to animate. Remove target.
//     if (startIndex === this.cards.length) {
//       this.resetTarget();
//       return;
//     }

//     const frames = [{
//       transform: `translateY(${this.targetBCR.height + 20}px)`
//     }, {
//       transform: 'none'
//     }];
//     const options = {
//       easing: 'cubic-bezier(0,0,0.31,1)',
//       duration: 150
//     };
//     const onAnimationComplete = () => this.resetTarget();

//     for (let i = startIndex; i < this.cards.length; i++) {
//       const card = this.cards[i];

//       // Move the card down then slide it up.
//       card
//         .animate(frames, options)
//         .addEventListener('finish', onAnimationComplete);
//     }
//   }

//   resetTarget() {
//     if (!this.target)
//       return;

//     this.target.style.willChange = 'initial';
//     this.target.style.transform = 'none';
//     this.target = null;
//   }
//   setUsers(){
//     console.log('abhi hua');
//   }
// }




