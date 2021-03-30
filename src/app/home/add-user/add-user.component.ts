import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; 
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  errorMessage: string;
  userData = {};
  submitted = false;
  userForm: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) private users: Object, private matDialogRef: MatDialogRef<AddUserComponent>,
          private formBuilder: FormBuilder) {
    this.userForm = this.formBuilder.group({
      mobile_no: ['', [Validators.required, Validators.min(1000000000), Validators.max(9999999999)]],
      name: ['', [Validators.required]],
      people: ['', [Validators.required, Validators.min(1)]],
      note: ['']
    })
    this.errorMessage = '';
   }

  ngOnInit(): void {
    console.log(this.users);
  }

  addUser(){
    for(let user in this.users){
      if( this.users[user]['name'].toUpperCase() == this.userForm.value['name'].toUpperCase()){
        this.errorMessage = 'There is already a waiting with the same name';
        setTimeout(() => {this.errorMessage = ''},5000);
        return;
      }
      if( this.users[user]['mobile_no'] == this.userForm.value['mobile_no']){
        this.errorMessage = 'There is already a waiting with the same number';
        setTimeout(() => {this.errorMessage = ''},5000);
        return;
      }
    }
    this.matDialogRef.close();
  }


  ngOnDestroy(){
    this.matDialogRef.close(this.userForm.value);
  }

  close(){
    this.userForm = this.formBuilder.group({
      mobile_no: ['', [Validators.required, Validators.min(1000000000), Validators.max(9999999999)]],
      name: ['', [Validators.required]],
      people: ['', [Validators.required, Validators.min(1)]],
      note: ['']
    })
    this.matDialogRef.close();
  }
}