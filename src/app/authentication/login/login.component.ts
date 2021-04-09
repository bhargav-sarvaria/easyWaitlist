import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {Router} from "@angular/router";
import { NgForm, FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { CommonService } from '../../common.service';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  error: any;
  email: string;
  password: string;
  errorMessage: string;
  showProgressBar: boolean;

  constructor(private formBuilder: FormBuilder, public authenticationService: AuthenticationService,
     public router: Router, private commonService: CommonService, updates: SwUpdate) { 
    
    updates.available.subscribe(event => {
      updates.activateUpdate().then(() => document.location.reload());
    });

    this.loginForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
    this.errorMessage = '';
    this.showProgressBar = false;
  }

  ngOnInit(): void {
    try {
      var x = JSON.parse(this.commonService.getCookie('globals'));
      var place_id = this.commonService.getCookie('place_id')

      if(place_id!= null && place_id!=''){
        // this.router.navigate(['home', { 'from_login':true }]);
        this.router.navigate(['home'], { queryParams:  { 'from_login':true }, skipLocationChange: true});

      }
    }
    catch(e){
      this.router.navigate(['login']);
    }
  }


  login() {
    this.showProgressBar = true;
    this.email = this.loginForm.get('emailId').value;
    this.password = this.loginForm.get('password').value;

    var encoded_password = this.authenticationService.encode(this.password);

    this.authenticationService.checkLogin(this.email, encoded_password)
    .subscribe(response=>{
      this.showProgressBar = false;
      console.log(response)
      if(response.hasOwnProperty('success') && response['success']) {
        this.authenticationService.SetCredentials(this.email, this.password);
        this.commonService.setCookie('place_id',response['_id']);
        // this.router.navigate(['home', { 'from_login':true }]);
        this.router.navigate(['home'], { queryParams:  { 'from_login':true }, skipLocationChange: true});
      } else {
          this.errorMessage = response['message'];
          setTimeout(() => {this.errorMessage = ''},5000);
      }
    }, error=>{
      this.showProgressBar = false;
      this.errorMessage = 'Please check your internet connection';
      console.log(error);
      setTimeout(() => {this.errorMessage = ''},5000);
    });
  }

  get items(){
    return this.loginForm.get('items') as FormArray;
  }
}
