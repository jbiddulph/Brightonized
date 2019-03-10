import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, ViewController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import firebase from 'firebase';

@Component({
  selector: 'page-addpub',
  templateUrl: 'addpub.html',
})
export class AddpubPage {
  pubname: string = "";
  pubaddress: string = "";
  pubtown: string = "";
  pubcounty: string = "";
  pubpostcode: string = "";
  pubtel: string = "";
  pubweb: string = "";
  pubkind: any[] = [];
  image: string;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private camera: Camera,
    private geolocation: Geolocation,
    private toastCtrl: ToastController,
    private viewCtrl: ViewController,
    private http: HttpClient) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddpubPage');
  }

  post() {
    firebase.firestore().collection("pubs").add({
      pubname: this.pubname,
      pubaddress: this.pubaddress,
      pubtown: this.pubtown,
      pubcounty: this.pubcounty,
      pubpostcode: this.pubpostcode,
      pubtel: this.pubtel,
      pubweb: this.pubweb,
      pubkind: this.pubkind,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: firebase.auth().currentUser.uid,
      owner_name: firebase.auth().currentUser.displayName
    }).then(async (doc) => {
      if(this.image) {
        await this.upload(doc.id)
      }
      this.pubname = "";
      this.pubaddress = "";
      this.pubtown = "";
      this.pubcounty = "";
      this.pubpostcode = "";
      this.pubtel = "";
      this.pubweb = "";
      this.pubkind = [];
      this.image = undefined

      let toast = this.toastCtrl.create({
        message: "Your pub has been created successfully.",
        duration: 3000
      }).present();
      this.viewCtrl.dismiss();
    }).catch((err) => {
      console.log(err)
    })
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

      
      let ref = firebase.storage().ref("pubImages/" + name);
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
          firebase.firestore().collection("pubs").doc(name).update({
            latitude: resp.coords.latitude,
            longitude: resp.coords.longitude
          })
         }).catch((error) => {
           console.log('Error getting location', error);
         });
        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          
          firebase.firestore().collection("pubs").doc(name).update({
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
  close() {
    this.viewCtrl.dismiss();
  }
}
