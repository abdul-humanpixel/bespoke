import { MyBankCoreComponent } from './my-bank-core.component';
import { NgModule } from '@angular/core';
import { MyBankLandingComponent } from './my-bank-landing.component';
import { MyBankRateComponent } from './my-bank-rate.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MyBankCoreComponent, MyBankLandingComponent, MyBankRateComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  providers: [{
    provide: 'plugins',
    useValue: [{
      name: 'my-bank-landing',
      component: MyBankLandingComponent,
      type: 'page',
      path: 'home',
    },
    {
      name: 'my-bank-rate',
      component: MyBankRateComponent,
      type: 'page',
      path: 'post-call',
    },
  ],
    multi: true
  }],
  entryComponents: [MyBankCoreComponent, MyBankLandingComponent, MyBankRateComponent],
  exports: [MyBankCoreComponent, MyBankLandingComponent, MyBankRateComponent]
})
export class MyBankLandingModule { }
