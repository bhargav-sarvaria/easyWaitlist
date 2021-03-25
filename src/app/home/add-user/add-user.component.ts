import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; 
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  userData = {name:'Aastha Singh', mobile_no:'8884014669'};
  submitted = false;
  userForm: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: Object, private matDialogRef: MatDialogRef<AddUserComponent>,
          private formBuilder: FormBuilder) {
    this.userForm = this.formBuilder.group({
      mobile_no: ['', [Validators.required, Validators.min(1000000000), Validators.max(9999999999)]],
      name: ['', [Validators.required]],
      people: ['', [Validators.required, Validators.min(1)]],
      note: ['']
    })
   }

  ngOnInit(): void {
  }
  hit(){
    this.matDialogRef.close();
  }


  ngOnDestroy(){
    this.matDialogRef.close(this.userForm.value);
  }

  onNoClick(){
    this.matDialogRef.close();
  }

}
