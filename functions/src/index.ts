import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
const corsHandler = cors({origin: true});
admin.initializeApp(functions.config().firebase);

const sendNotification = (owner_uid, type) => {

    return new Promise((resolve, reject) => {
        admin.firestore().collection("users").doc(owner_uid).get().then((doc) => {
            if(doc.exists && doc.data().token){
                 if(type === "new_comment") {
                     admin.messaging().sendToDevice(doc.data().token, {
                         data: {
                             title: "A new comment has been made on your post",
                             sound: "default",
                             body: "Top to check"
                         }
                     }).then((sent) => {
                         resolve(sent)
                     }).catch((err) => {
                         reject(err)
                     })
                 } else if (type === "new_like"){
                    admin.messaging().sendToDevice(doc.data().token, {
                        data: {
                            title: "Someone liked your post",
                            sound: "default",
                            body: "Top to check"
                        }
                    }).then((sent) => {
                        resolve(sent)
                    }).catch((err) => {
                        reject(err)
                    });
                 }
            }
        })
    })
}

export const updateLikesCount = functions.https.onRequest((request, response) => {
    // tslint:disable-next-line:no-empty
    corsHandler(request, response, () => {});
    console.log(request.body);

    const postId = request.body.postId;
    const userId = request.body.userId;
    const action = request.body.action; //like or unlike

    admin.firestore().collection("posts").doc(postId).get().then((data)=>{
        console.log(data);
        let likesCount = data.data().likesCount || 0; // if like doesn't exists pass 0
        const likes = data.data().likes || [];
    
        const updateData = {}; 
    
        if(action === "like"){
            updateData["likesCount"] = ++likesCount; 
            updateData[`likes.${userId}`] = true; 
        }else{
            updateData["likesCount"] = --likesCount; 
            updateData[`likes.${userId}`] = false; 
        }
    
        admin.firestore().collection("posts").doc(postId).update(updateData).then(async () =>{

            if(action === "like"){
                await sendNotification(data.data().owner, "new_like")
            }

            response.status(200).send("Done")
        }).catch((err)=>{
            response.status(err.code).send(err.message);
        })
    }).catch((err)=>{
        response.status(err.code).send(err.message); 
    }).catch((err) => {
        response.status(err.code).send(err.message);
    })
})

export const updateCommentsCount = functions.firestore.document('comments/{commentId}').onCreate(async (event) => {
    let data = event.data();
    
    let postId = data.post;
    let doc = await admin.firestore().collection("posts").doc(postId).get();

    if(doc.exists){
        let commentsCount = doc.data().commentsCount || 0;
        commentsCount++;
        await admin.firestore().collection("posts").doc(postId).update({
            "commentsCount": commentsCount
        })

        return sendNotification(doc.data().owner, "new_comment");
    
    } else {
        return false;
    }

})