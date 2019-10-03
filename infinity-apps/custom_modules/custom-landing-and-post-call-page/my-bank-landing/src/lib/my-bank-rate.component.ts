import firebase from '@firebase/app';
import '@firebase/firestore';

import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'my-bank-rate',
  template: `
  <div class="my-bank-landing">
    <my-bank-core></my-bank-core>
    <div class="my-bank-landing__bg">
      <a class="my-bank-landing__logo" href="/"></a>
    </div>
    <div class="my-bank-landing__content" *ngIf="!isRated">
      <h1 class="my-bank-landing__header">
        How would you rate your call?
      </h1>
      <div class="my-bank-landing__container">
        <div (click)="rateCall('Good')" class="my-bank-landing__btn">Good</div>
        <div (click)="rateCall('Moderate')" class="my-bank-landing__btn">Moderate</div>
        <div (click)="rateCall('Bad')" class="my-bank-landing__btn">Bad</div>
      </div>
    </div>
    <div class="my-bank-landing__content" *ngIf="isRated">
      <p class="my-bank-landing__text">Thanks for your response. You can close the tab now.</p>
    </div>
  </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class MyBankRateComponent implements OnInit {
  db: any;
  isRated = false;

  constructor() { }

  ngOnInit() {
    // IN MY EXAMPLE I USED FIREBASE BUT YOU CAN USE ANY BACKEND YOU WANT
    // const config = {
    //   apiKey: '',
    //   authDomain: '',
    //   databaseURL: '',
    //   projectId: '',
    //   storageBucket: '',
    //   messagingSenderId: '',
    //   appId: ''
    // };

    // firebase.initializeApp(config);
    // this.db = firebase.firestore();
  }

  rateCall(rate: string) {
    this.isRated = true;
    // return this.db.collection('call-rates').add({
    //   rate,
    //   userId: Date.now(),
    // });
  }
}
