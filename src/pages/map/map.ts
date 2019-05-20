import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import firebase from 'firebase';
import moment from 'moment';
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  
  
  post: any = {};
  selectedpost: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
    
    this.post = this.navParams.get("post");
    console.log('post passed into map component', this.post);
    
    firebase.firestore().collection("posts")
    .get(this.post)
    .then((data) => {
      console.log('data here:::', data)
      this.selectedpost = data.docs;
    }).catch((err) => {
      console.log(err)
    });
  }

  close() {
    this.viewCtrl.dismiss();
  }

  ago(time) {
    let difference = moment(time).diff(moment());
    return moment.duration(difference).humanize();
  }

}
