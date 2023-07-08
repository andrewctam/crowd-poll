import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from  '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { AppRoutingModule, routes } from './app-routing.module';

import { AppComponent } from './app.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { PollComponent } from './components/poll/poll.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { CreatedPollsComponent } from './components/welcome/created-polls/created-polls.component';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { VotingComponent } from './components/poll/voting/voting.component';
import { PollOptionComponent } from './components/poll/voting/poll-option/poll-option.component';
import { SettingsComponent } from './components/poll/settings/settings.component';
import { SettingsCheckboxComponent } from './components/poll/settings/settings-checkbox/settings-checkbox.component';
import { DropdownComponent } from './components/poll/voting/dropdown/dropdown.component';
import { DropdownOptionComponent } from './components/poll/voting/dropdown/dropdown-option/dropdown-option.component';
import { SortPipe } from './pipes/sort.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { StatisticsComponent } from './components/poll/statistics/statistics.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    PollComponent,
    AlertsComponent,
    CreatedPollsComponent,
    VotingComponent,
    PollOptionComponent,
    SettingsComponent,
    SettingsCheckboxComponent,
    DropdownComponent,
    DropdownOptionComponent,
    SortPipe,
    FilterPipe,
    StatisticsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    provideRouter(routes, withComponentInputBinding()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
