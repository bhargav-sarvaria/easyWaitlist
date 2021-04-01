import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import { NgForm, AbstractControl, FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { CommonService } from '../../common.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  showProgressBar: boolean;
  error: any;
  errorMessage: string;
  
  constructor(private formBuilder: FormBuilder, public authenticationService: AuthenticationService, public router: Router, private commonService: CommonService) { 
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      mobile_no: ['', [Validators.required, Validators.min(1000000000), Validators.max(9999999999)]],
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password_verification: ['', Validators.required],
      terms: ['', Validators.required]
    })
    this.showProgressBar = false;
    this.errorMessage = '';
  }

  ngOnInit(): void {
    try {
      var x = JSON.parse(this.commonService.getCookie('globals'));
      var place_id = this.commonService.getCookie('place_id')

      if(place_id!= null && place_id!=''){
        this.router.navigate(['home', { 'from_login':true }]);
      }
    }
    catch(e){
      this.router.navigate(['register']);
    }
  }

  timeout: any = null;

  public onKeySearch(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.validateReEnteredPassword(event.target.value);
      }
    }, 1000);
  }

  private validateReEnteredPassword(value: string) {
    if(this.registerForm.get('password').value != this.registerForm.get('password_verification').value){
      this.registerForm.get('password_verification').setErrors({'incorrect': true});
    }
  }

  register(){
    if(this.registerForm.get('password').value != this.registerForm.get('password_verification').value){
      this.registerForm.get('password_verification').setErrors({'incorrect': true});
      return;
    }

    this.showProgressBar = true;
    var name = this.registerForm.get('name').value;
    var mobile_no = this.registerForm.get('mobile_no').value;
    var email = this.registerForm.get('emailId').value;
    var password = this.registerForm.get('password').value;

    var encoded_password = this.authenticationService.encode(password);

    this.authenticationService.register(name, mobile_no, email, encoded_password)
    .subscribe(response=>{
      console.log(response)
      if(response.hasOwnProperty('success') && response['success']) {
        this.authenticationService.SetCredentials(email, password);
        this.commonService.setCookie('place_id',response['_id']);
        console.log('registerd');
        this.router.navigate(['home', { 'from_login':true }]);
      } else {
          this.errorMessage = response['message'];
          this.showProgressBar = false;
          setTimeout(() => {this.errorMessage = ''},5000);
      }
    }, error=>{
      this.showProgressBar = false;
      this.errorMessage = 'Please check your internet connection';
      console.log(error);
      setTimeout(() => {this.errorMessage = ''},5000);
    })
  }

}
