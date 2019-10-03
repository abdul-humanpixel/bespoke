import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';

@Component({
  selector: 'my-bank-landing',
  template: `
    <div class="my-bank-landing">
      <my-bank-core></my-bank-core>
      <div class="my-bank-landing__bg">
          <a class="my-bank-landing__logo" href="/"></a>
      </div>
      <div class="my-bank-landing__content">
        <h1 class="my-bank-landing__header">
          Welcome to My Bank
        </h1>
        <p class="my-bank-landing__text">Provide your name and connect to one of our consultants</p>
        <input type="text" autofocus [(ngModel)]="name"  class="my-bank-landing__input" />
        <button class="my-bank-landing__btn" (click)="navigateToConference()"> Connect </button>
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class MyBankLandingComponent implements OnInit {
  name: string;
  pexUserSettingsValues: any;
  conferenceName = 'meet.lukasz';

  constructor() { }

  ngOnInit() {
    try {
      this.pexUserSettingsValues = JSON.parse(localStorage.getItem('pexUserSettingsValues'));
    } catch (e) {

    }
    if (!this.pexUserSettingsValues) {
      this.pexUserSettingsValues = {};
    }
    if (this.pexUserSettingsValues && this.pexUserSettingsValues.displayName) {
      this.name = this.pexUserSettingsValues.displayName;
    }
  }

  navigateToConference() {
    if (!this.name) {
      return;
    }
    window.location.href = `/conference/${this.conferenceName}?name=${this.name}`;
  }

}
