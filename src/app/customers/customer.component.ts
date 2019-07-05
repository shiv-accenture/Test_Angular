import { Component, OnInit } from '@angular/core';
import {FormGroup,FormControl, FormBuilder,Validator, Validators, AbstractControl, ValidatorFn, FormArray} from '@angular/forms';
import{debounceTime} from 'rxjs/operators'
import { Customer } from './customer';
import { fbind } from 'q';
import { Key } from 'protractor';


//Custom Validator with parameter
function rangeValidator(min:number,max:number):ValidatorFn{
return (c:AbstractControl): { [Key:string]: boolean } | null => {
  if(c.value !== null && (isNaN(c.value) || c.value < min || c.value > max))
  {
return {'range':true};
  }
  return null;
}
}

function emailMatcher(c : AbstractControl): { [Key:string]: boolean} | null {
  const emailcontrol= c.get('email');
  const confirmemailcontrol= c.get('confirmemail');
  if(emailcontrol.pristine || confirmemailcontrol.pristine)
  {
    return null;
  }
if(emailcontrol.value === confirmemailcontrol.value)
{
  return null;
}
return {'match': true};
}

// //Custom Validator without parameter
// function rangeValidator(c:AbstractControl): { [Key:string]: boolean } | null{
//   if(c.value !== null && (isNaN(c.value) || c.value < 1 || c.value > 5))
//   {
// return {'range':true};
//   }
//   return null;
// }

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})

export class CustomerComponent implements OnInit {
customerForm: FormGroup; //Root formGroup declared
  customer = new Customer();
emailMessage: string;

private validationMessage ={
required:"Please enter your Email Addess.",
email:"Please enter the valid email value"
};

  constructor(private fb:FormBuilder) { }

  //Using Form Array
  get addresses(): FormArray{
    return <FormArray> this.customerForm.get('addresses');
  }


  ngOnInit() {

      this.customerForm= this.fb.group({
  firstName:["",[Validators.required,Validators.minLength(3)]],
  lastName:["",[Validators.required,Validators.maxLength(50)]],
  emailGroup:this.fb.group({
    email:['',[Validators.required,Validators.email]],
    confirmemail:['',Validators.required]
  },{validator:emailMatcher}),
  phone:'',
  notification:'email',
//rating: [null, rangeValidator],
rating: [null, rangeValidator(1,5)],
sendCatalog:true,
addresses: this.fb.array([ this.buildAddress()])

    });

//this is not required as we added formbuilder service that will have short form of below requirement
    // this.customerForm= new FormGroup({
    //   firstName: new FormControl(),
    //   lastName: new FormControl(),
    //   email: new FormControl(),
    //   sendCatalog: new FormControl(true)
    // });

// to use of watcher. Through watcher we can use validation in component also instead of adding click event in html
this.customerForm.get('notification').valueChanges.subscribe(
  value=> this.SetNotification(value));

  const emailControl= this. customerForm.get('emailGroup.email');
  emailControl.valueChanges.pipe(debounceTime(1000)).
  subscribe(value=> this.Setmessage(emailControl));

  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  Setmessage(c:AbstractControl):void{
    this.emailMessage='';
    if((c.touched || c.dirty)&& c.errors) 
    {
      this.emailMessage=Object.keys(c.errors).map(
        key => this.emailMessage += this.validationMessage[key]).join(' ');
      
    }
  }

  addAddress():void{
    this.addresses.push(this.buildAddress());
  }

buildAddress():FormGroup {
  return this.fb.group({
    addressType:'home',
    street1:'',
    street2:'',
    city:'',
    state:'',
    zip:''
  })
}

SetNotification(Notifyvia:string):void{
const phoneControl=this.customerForm.get('phone');
if(Notifyvia === 'text')
{
  phoneControl.setValidators(Validators.required);
}
else{
  phoneControl.clearValidators();
}
phoneControl.updateValueAndValidity();
}

  populateTestData():void {
this.customerForm.setValue({
  firstName:"Shiv",
lastName: "Shankar",
email: "Shiv.Shankar@mindtree.com",
sendCatalog:false
})
}

PatchValueTestData():void{
  this.customerForm.patchValue({
    firstName:"Shiva",
    lastName:"Shankar",
    sendCatalog:false
  })
}

}
