import {Component, ViewChild, ElementRef, OnInit} from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, ModalController, ActionSheetController, AlertController } from 'ionic-angular';
import firebase from 'firebase';
import moment from 'moment';
import { LoginPage } from '../login/login';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { CommentsPage } from '../comments/comments';
import { MapPage } from '../map/map';
import { Firebase } from '@ionic-native/firebase';
import {FeedService} from "./feed.service";


@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
  providers: [FeedService]
})
export class FeedPage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  text: string = "";
  posts: any[] = [];
  pageSize: number = 10;
  cursor: any;
  infiniteEvent: any;
  image: string;
  latitude: number;
  longitude: number;
  myData: any = {};
  coords: any = {};

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController,
    private camera: Camera,
    private geolocation: Geolocation,
    private http: HttpClient,
    private modal: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private firebaseCordova: Firebase,
    private feedService: FeedService) {
    // this.getPosts()
    // this.firebaseCordova.getToken().then((token) => {
    //   console.log('this is the token', token);
    //   this.updateToken(token, firebase.auth().currentUser.uid);
    // }).
    // catch((err) => {
    //   console.log(err);
    // })
  }

  // updateToken(token: string, uid: string) {
  //   firebase.firestore().collection("users").doc(uid).set({
  //     token: token,
  //     tokenUpdate: firebase.firestore.FieldValue.serverTimestamp()
  //   }, {
  //     merge: true
  //   }).then(() => {
  //     console.log("Token saved to cloud firestore")
  //   }).catch((err) => {
  //     console.log('this is the error: ',err);
  //   })
  // }

  // getPosts() {
  //   this.posts = []
  //   let loading = this.loadingCtrl.create({
  //     content: "Loading Feed..."
  //   })
  //   loading.present()
  //   let query = firebase.firestore().collection("posts").orderBy("created", "desc").limit(this.pageSize)
  //
  //
  //   query.onSnapshot((snapshot) => {
  //     let changedDocs = snapshot.docChanges();
  //
  //     changedDocs.forEach((change) => {
  //       if(change.type == "added"){
  //         //TODO
  //       }
  //       if(change.type == "modified"){
  //         //TODO
  //         for(let i = 0; i < this.posts.length; i++){
  //           if(this.posts[i].id == change.doc.id){
  //             this.posts[i] = change.doc;
  //           }
  //         }
  //       }
  //       if(change.type == "removed"){
  //         //TODO
  //       }
  //     })
  //   })
  //
  //   query.get()
  //   .then((docs) => {
  //
  //     docs.forEach((doc) => {
  //       this.posts.push(doc)
  //
  //     })
  //     loading.dismiss()
  //
  //     this.cursor = this.posts[this.posts.length -1];
  //
  //   }).catch((err) => {
  //     console.log(err)
  //   })
  // }

  ngOnInit() {
    this.feedService.getPosts();
  }
  // post() {
  //   firebase.firestore().collection("posts").add({
  //     text: this.text,
  //     created: firebase.firestore.FieldValue.serverTimestamp(),
  //     owner: firebase.auth().currentUser.uid,
  //     owner_name: firebase.auth().currentUser.displayName
  //   }).then(async (doc) => {
  //     if(this.image) {
  //       await this.upload(doc.id)
  //     }
  //     this.text = "";
  //     this.image = undefined
  //
  //     let toast = this.toastCtrl.create({
  //       message: "Your post has been created successfully.",
  //       duration: 3000
  //     }).present();
  //     this.feedService.getPosts()
  //   }).catch((err) => {
  //     console.log(err)
  //   })
  // }
  // loadMorePosts(event) {
  //   firebase.firestore().collection("posts").orderBy("created", "desc").startAfter(this.cursor).limit(this.pageSize).get()
  //   .then((docs) => {
  //     docs.forEach((doc) => {
  //       this.posts.push(doc)
  //     })
  //     if(docs.size < this.pageSize){
  //       event.enable(false);
  //       this.infiniteEvent = event;
  //     } else {
  //       event.complete();
  //       this.cursor = this.posts[this.posts.length -1];
  //     }
  //
  //   }).catch((err) => {
  //     console.log(err)
  //   })
  // }

  // refresh(event){
  //   this.posts = [];
  //
  //   this.feedService.getPosts();
  //   if(this.infiniteEvent){
  //     this.infiniteEvent.enable(true);
  //   }
  //   event.complete();
  // }
  //
  // ago(time) {
  //   let difference = moment(time).diff(moment());
  //   return moment.duration(difference).humanize();
  // }
  refresh(event) {
    this.feedService.refresh(event);
  }

  ago(time){
    this.feedService.ago(time);
  }

  logout(){
    this.feedService.logout();
  }
  addPhoto() {
    this.feedService.launchLibrary()
  }
  addPhotoFromCam() {
    this.feedService.launchCamera()
  }
  launchCamera() {
    this.feedService.launchCamera();
  }
  launchLibrary(){
    this.feedService.launchLibrary();
  }

  upload(name: string) {
    this.feedService.upload(name);
  }

  like(post){
    this.feedService.like(post);
  }

  openModal(post) {
    this.feedService.openModal(post);
  }

  comment(post) {
    this.feedService.comment(post);
  }
}
