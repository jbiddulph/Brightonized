import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpClientModule} from '@angular/common/http';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { FeedPage } from '../pages/feed/feed';
import { AboutPage } from '../pages/about/about';
import { EventsPage } from '../pages/events/events';
import { VenuesPage } from '../pages/venues/venues';
import { MapPage } from '../pages/map/map';
import { CommentsPage } from '../pages/comments/comments';
import { AddpubPage } from '../pages/addpub/addpub';
import { AddeventPage } from '../pages/addevent/addevent';
import { Camera } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { Firebase } from '@ionic-native/firebase';
import firebase from 'firebase';

var config = {
  apiKey: "AIzaSyAGtx5LqMd0IfMgUWVZ7NVDLvpDrQWFpak",
  authDomain: "quotes-cc05d.firebaseapp.com",
  databaseURL: "https://quotes-cc05d.firebaseio.com",
  projectId: "quotes-cc05d",
  storageBucket: "quotes-cc05d.appspot.com",
  messagingSenderId: "48609054717"
};
firebase.initializeApp(config);
firebase.firestore().settings({
  timestampsInSnapshots: true
})

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignupPage,
    FeedPage,
    AboutPage,
    EventsPage,
    VenuesPage,
    MapPage,
    CommentsPage,
    AddpubPage,
    AddeventPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignupPage,
    FeedPage,
    AboutPage,
    EventsPage,
    VenuesPage,
    MapPage,
    CommentsPage,
    AddpubPage,
    AddeventPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    Geolocation,
    Firebase,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
