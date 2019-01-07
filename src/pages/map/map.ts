import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {

  constructor(public navParams: NavParams, private view: ViewController) {
  }

  ionViewWillLoad() {
    const moredata = this.navParams.get('data');
    console.log('here we go: '+moredata);
  }
  closeModal() {
    this.view.dismiss();
  }

}
