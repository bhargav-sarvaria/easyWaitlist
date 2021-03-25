import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {Router} from "@angular/router";
import { NgForm, FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { CommonService } from '../../common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  dataLoading = false;
  error: any;
  email: string;
  password: string;

  constructor(private formBuilder: FormBuilder, public authenticationService: AuthenticationService, public router: Router, private commonService: CommonService) { 
    this.loginForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    try {
      console.log(this.commonService.getCookie('globals'));
      var x = JSON.parse(this.commonService.getCookie('globals'));
      var place_id = this.commonService.getCookie('place_id')

      if(place_id!= null && place_id!=''){
        this.router.navigate(['home']);
      }
    }
    catch(e){
      this.router.navigate(['login']);
      console.log(e)
    }
  }


  login() {
    this.dataLoading = true;
    this.email = this.loginForm.get('emailId').value;
    this.password = this.loginForm.get('password').value;

    var encoded_password = this.authenticationService.encode(this.password);

    this.authenticationService.checkLogin(this.email, encoded_password)
    .subscribe(response=>{
      console.log(response)
      if(response.hasOwnProperty('success') && response['success']) {
        this.authenticationService.SetCredentials(this.email, this.password);
        this.commonService.setCookie('place_id',response['_id']);
        this.router.navigate(['home']);
      } else {
          this.error = response['message'];
          this.dataLoading = false;
      }
    }, error=>{
      this.error = error;
      console.log(error);
    });
  }

  get items(){
    return this.loginForm.get('items') as FormArray;
  }
}
