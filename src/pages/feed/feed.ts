import {Component, ViewChild, ElementRef, Injectable, OnInit} from '@angular/core';
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

@Injectable()
@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
  providers:[FeedService]
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
    this.feedService.getPosts()
    this.firebaseCordova.getToken().then((token) => {
      console.log('this is the token', token);
      this.updateToken(token, firebase.auth().currentUser.uid);
    }).
    catch((err) => {
      console.log(err);
    })
  }

  ngOnInit() {
    console.log('The component is initialized');
  }

  updateToken(token: string, uid: string) {
    this.feedService.updateToken(token, uid);
  }

  getPosts() {
    this.feedService.getPosts();
  }
  post() {
    this.feedService.post();
  }
  loadMorePosts(event) {
    this.feedService.loadMorePosts(event);
  }

  refresh(event){
    this.feedService.refresh(event);
  }

  ago(time) {
    this.feedService.ago(time)
  }
  logout() {
    this.feedService.logout();
  }
  addPhoto() {
    this.feedService.launchLibrary();
  }
  addPhotoFromCam() {
    this.feedService.launchCamera();
  }
  launchCamera() {
    this.feedService.launchCamera();
  }

  launchLibrary() {
    this.feedService.launchLibrary();
  }

  upload(name: string) {
    this.feedService.upload(name);
  }

  like(post) {
    this.feedService.like(post);
  }

  openModal(post) {
    this.feedService.openModal(post);
  }

  comment(post) {
    this.feedService.comment(post);
  }
}
