import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, ModalController, ActionSheetController, AlertController } from 'ionic-angular';
import firebase from 'firebase';
import moment from 'moment';
import { LoginPage } from '../login/login';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { CommentsPage } from '../comments/comments';
import { AddpubPage } from '../addpub/addpub';
import { AddeventPage } from '../addevent/addevent';
import { MapPage } from '../map/map';
import * as _ from 'lodash';

@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {
  text: string = "";
  events: any[] = [];
  pageSize: number = 10;
  cursor: any;
  infiniteEvent: any;
  image: string;
  latitude: number;
  longitude: number;
  isAdmin = false;
  myData: any = {};
  coords: any = {};
  userName: string;
  pubs: any[] = [];
  pubz: any;
  filteredPubs: any;
  venue: string = "";
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController,
    private camera: Camera,
    private geolocation: Geolocation,
    private http: HttpClient,
    private modal: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController) {
      this.getEvents()
      this.userName =  firebase.auth().currentUser.email;
      if(this.userName == "letmein@gmail.com"){
        this.isAdmin = true;
      }
      this.getPubs()
  }

  /// Active filter rules
  filters = {}

  // ngOnInit() {
  //   firebase.firestore().collection("pubs")

  //     .onSnapshot(function(pubs) {
  //       this.pubs = pubs;
  //       this.applyFilters()
  //   })
  // }

  // private applyFilters() {
  //   this.filteredPubs = _.filter(this.pubs, _.conforms(this.filters) )
  // }

  // /// filter property by equality to rule
  // filterExact(property: string, rule: any) {
  //   console.log('Selected', rule)
  //   this.filters[property] = val => val == rule
  //   this.applyFilters()
  // }

  getEvents() {
    this.events = []
    let loading = this.loadingCtrl.create({
      content: "Loading Feed..."
    })
    loading.present()
    let query = firebase.firestore().collection("events").orderBy("created", "desc").limit(this.pageSize)
    
    
    query.onSnapshot((snapshot) => {
      let changedDocs = snapshot.docChanges();
      // this.pubs = changedDocs;
      // this.applyFilters();

      changedDocs.forEach((change) => {
        if(change.type == "added"){
          //TODO
        }
        if(change.type == "modified"){
          //TODO
          for(let i = 0; i < this.events.length; i++){
            if(this.events[i].id == change.doc.id){
              this.events[i] = change.doc;
            }
          }
        }
        if(change.type == "removed"){
          //TODO
        }
      })
    })

    query.get()
    .then((docs) => {
      
      docs.forEach((doc) => {
        this.events.push(doc)
        
      })
      
      loading.dismiss()
        
      this.cursor = this.events[this.events.length -1];
      
    }).catch((err) => {
      console.log(err)
    })
  }
  post() {
    firebase.firestore().collection("events").add({
      text: this.text,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: firebase.auth().currentUser.uid,
      owner_name: firebase.auth().currentUser.displayName
    }).then(async (doc) => {
      if(this.image) {
        //await this.upload(doc.id)
      }
      this.text = "";
      this.image = undefined

      let toast = this.toastCtrl.create({
        message: "Your post has been created successfully.",
        duration: 3000
      }).present();
      this.getEvents()
    }).catch((err) => {
      console.log(err)
    })
  }

  getPubs() {
    this.pubs = []
    let loading = this.loadingCtrl.create({
      content: "Loading Pubs..."
    })
    loading.present()
    let query = firebase.firestore().collection("pubs").orderBy("created", "desc")

    query.get()
    .then((docs) => {

      docs.forEach((doc) => {
        this.pubs.push(doc)
        
      })
      loading.dismiss()
        
      this.cursor = this.pubs[this.pubs.length -1];
      
    }).catch((err) => {
      console.log(err)
    })
  }

  loadMorePosts(event) {
    firebase.firestore().collection("events").orderBy("created", "desc").startAfter(this.cursor).limit(this.pageSize).get()
    .then((docs) => {
      docs.forEach((doc) => {
        this.events.push(doc)
      })
      if(docs.size < this.pageSize){
        event.enable(false);
        this.infiniteEvent = event;
      } else {
        event.complete();
        this.cursor = this.events[this.events.length -1];
      }
      
    }).catch((err) => {
      console.log(err)
    })
  }

  refresh(event){
    this.events = [];

    this.getEvents();
    if(this.infiniteEvent){
      this.infiniteEvent.enable(true);
    }
    event.complete();
  }

  ago(time) {
    let difference = moment(time).diff(moment());
    return moment.duration(difference).humanize();
  }
  logout() {
    firebase.auth().signOut().then(() => {
      let toast = this.toastCtrl.create({
        message: "You have logged out successfully.",
        duration: 3000
      }).present();
      this.navCtrl.setRoot(LoginPage)
    });
  }
  like(post) {
    let body = {
      postId: post.id,
      userId: firebase.auth().currentUser.uid,
      action: post.data().likes && post.data().likes[firebase.auth().currentUser.uid] == true ? "unlike" : "like"
    } 

    let toast = this.toastCtrl.create({
      message: "Liking post"
    });
    toast.present();
    // console.log("here is the PostID: ", post.id)
    // console.log("here is the userID: ", firebase.auth().currentUser.uid)
    // console.log("here is the PostID: ", post.data().likes && post.data().likes[firebase.auth().currentUser.uid] == true ? 'unlike' : 'like') 
    this.http.post("https://us-central1-quotes-cc05d.cloudfunctions.net/updateLikesCount", body, {
      responseType: "text"
    }).subscribe((data) => {
      toast.setMessage("LIKED!")
      setTimeout(() => {
        toast.dismiss();
      }, 3000)
    }, (error) => {
      toast.setMessage("An error has occured, please try again later!")
      setTimeout(() => {
        toast.dismiss();
      }, 3000)
      console.log("here is the error: ", error)
    })
  }

  addPub(post) {
    this.modal.create(AddpubPage, {
      "thepost": post
    }).present();
  }
  addEvent(post) {
    this.modal.create(AddeventPage, {
      "thepost": post
    }).present();
  }

  openModal(post) {
    this.modal.create(MapPage, {
      "thepost": post
    }).present();
  }

  comment(post) {
    this.actionSheetCtrl.create({
      buttons: [
        {
          text: "View All Comments",
          handler: () => {
            this.modal.create(CommentsPage, {
              "post": post
            }).present();
          }
        },
        {
          text: "New Comment",
          handler: () => {
            this.alertCtrl.create({
              title: "New Comment",
              message: "type your message",
              inputs: [
                {
                name: "comment",
                type: "text"
                }
              ],
              buttons: [
                {
                  text: "Cancel",
              },
              {
                text: "Post",
                handler: (data) => {
                  if(data.comment){
                    firebase.firestore().collection("comments").add({
                      text: data.comment,
                      post: post.id,
                      owner: firebase.auth().currentUser.uid,
                      owner_name: firebase.auth().currentUser.displayName,
                      created: firebase.firestore.FieldValue.serverTimestamp()
                    }).then((doc) => {
                      this.toastCtrl.create({
                        message: "Comment posted successfully!",
                        duration: 3000
                      }).present();
                    }).catch((err) => {
                      this.toastCtrl.create({
                        message: err.message,
                        duration: 3000
                      }).present();
                    })
                  }
                }
              }
            ]
            }).present();            
          }
        }
      ]
    }).present();
  }

}
