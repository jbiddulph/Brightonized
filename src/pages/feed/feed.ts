import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, ModalController } from 'ionic-angular';
import firebase from 'firebase';
import moment from 'moment';
import { LoginPage } from '../login/login';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
declare var google;
@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {
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

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController,
    private camera: Camera,
    private geolocation: Geolocation,
    private http: HttpClient,
    private modal: ModalController ) {
    this.getPosts()
    
  }
  getPosts() {
    this.posts = []
    let loading = this.loadingCtrl.create({
      content: "Loading Feed..."
    })
    loading.present()
    let query = firebase.firestore().collection("posts").orderBy("created", "desc").limit(this.pageSize)
    
    
    // query.onSnapshot((snapshot) => {
    //   let changedDocs = snapshot.docChanges();

    //   changedDocs.forEach((change) => {
    //     if(change.type == "added"){
    //       //TODO
    //     }
    //     if(change.type == "modified"){
    //       //TODO
    //       console.log("Document with ID " + change.doc.id + " has been modified")
    //     }
    //     if(change.type == "removed"){
    //       //TODO
    //     }
    //   })
    // })

    query.get()
    .then((docs) => {

      docs.forEach((doc) => {
        this.posts.push(doc)
        
      })
      loading.dismiss()
        
      this.cursor = this.posts[this.posts.length -1];
      
    }).catch((err) => {
      console.log(err)
    })
  }
  post() {
    firebase.firestore().collection("posts").add({
      text: this.text,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: firebase.auth().currentUser.uid,
      owner_name: firebase.auth().currentUser.displayName
    }).then(async (doc) => {
      if(this.image) {
        await this.upload(doc.id)
      }
      this.text = "";
      this.image = undefined

      let toast = this.toastCtrl.create({
        message: "Your post has been created successfully.",
        duration: 3000
      }).present();
      this.getPosts()
    }).catch((err) => {
      console.log(err)
    })
  }
  loadMorePosts(event) {
    firebase.firestore().collection("posts").orderBy("created", "desc").startAfter(this.cursor).limit(this.pageSize).get()
    .then((docs) => {
      docs.forEach((doc) => {
        this.posts.push(doc)
      })
      if(docs.size < this.pageSize){
        event.enable(false);
        this.infiniteEvent = event;
      } else {
        event.complete();
        this.cursor = this.posts[this.posts.length -1];
      }
      
    }).catch((err) => {
      console.log(err)
    })
  }

  refresh(event){
    this.posts = [];

    this.getPosts();
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
  addPhoto() {
    this.launchLibrary()
  }
  addPhotoFromCam() {
    this.launchCamera()
  }
  launchCamera() {
    let options: CameraOptions = {
      quality: 90,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetHeight: 512,
      targetWidth: 512,
      allowEdit: true

    }
    this.camera.getPicture(options).then((toBase64String) => {
      console.log(toBase64String)
      this.image = "data:image/png;base64," + toBase64String
      console.log(this.image)
    })
  }

  launchLibrary() {
    let options: CameraOptions = {
      quality: 90,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetHeight: 512,
      targetWidth: 512,
      allowEdit: true

    }
    this.camera.getPicture(options).then((toBase64String) => {
      console.log(toBase64String)
      this.image = "data:image/png;base64," + toBase64String
      console.log(this.image)
    })
  }

  upload(name: string) {
    return new Promise((resolve, reject) => {
      let loading = this.loadingCtrl.create({
        content: "Uploading Image..."
      })
      loading.present()

      

      let ref = firebase.storage().ref("postImages/" + name);
      let uploadTask = ref.putString(this.image.split(',')[1], "base64");
      uploadTask.on("state_changed", (taskSnapshot: any) => {
        console.log(taskSnapshot)
        let percentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
        loading.setContent("Uploaded " + percentage + "%...")
      }, (error) => {
        console.log(error)
      }, () => {
        console.log("upload complete")
        this.geolocation.getCurrentPosition().then((resp) => {
          
          resp.coords.latitude
          resp.coords.longitude
          console.log(resp.coords.latitude)
          firebase.firestore().collection("posts").doc(name).update({
            latitude: resp.coords.latitude,
            longitude: resp.coords.longitude
          })
         }).catch((error) => {
           console.log('Error getting location', error);
         });
        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          
          firebase.firestore().collection("posts").doc(name).update({
            image: url
          }).then(() => {
            loading.dismiss()
            resolve()
          }).catch(() => {
            loading.dismiss()
            reject()
          })
        }).catch(() => {
          loading.dismiss()
          reject()
        })
      })
    })
  }

  like(post) {
    let body = {
      postId: post.Id,
      userId: firebase.auth().currentUser.uid,
      action: post.data().likes && post.data().likes[firebase.auth().currentUser.uid] == true ? "unlike" : "like"
    }
    this.http.post("https://us-central1-quotes-cc05d.cloudfunctions.net/updateLikesCount", JSON.stringify(body), {
      responseType: "text"
    }).subscribe((data) => {
      console.log(data)
    }, (error) => {
      console.log(error)
    })
  }

  openModal() {
    const mapModal = this.modal.create('MapPage', { data: this.post });
    mapModal.present();
  }
}
