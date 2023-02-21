import { initializeApp } from 'firebase/app';
import { getFirestore, Timestamp, collection, getDoc, addDoc, updateDoc, query, where, type WhereFilterOp, getDocs, onSnapshot, doc, DocumentSnapshot, type DocumentData, setDoc } from 'firebase/firestore';
import { initializeAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, browserLocalPersistence, browserPopupRedirectResolver, browserSessionPersistence } from 'firebase/auth';

const DB = {
   Collections: { values: 'values', logs: 'logs', roles: 'roles' },
   Roles: { family: 'family' },
   state: { added: 'added', modified: 'modified', removed: 'removed' }
};

const firebaseConfig = {
  apiKey: 'AIzaSyCc-RLcg0UhWmmXc8Lggl-LnceAr1UnkYU',
  authDomain: 'whats-up-home-iot.firebaseapp.com',
  projectId: 'whats-up-home-iot',
  storageBucket: 'whats-up-home-iot.appspot.com',
  messagingSenderId: '939481304082',
  appId: '1:939481304082:web:9e67ea9e239b8c4b1d5ccb',
  measurementId: 'G-LSMFWTCFJ0'
 };

// Initialize Firebase
const _app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const _db = getFirestore(_app);
const _auth = initializeAuth(_app, { persistence: [ browserLocalPersistence, browserSessionPersistence ] });

function getCollection(collectionName: string, field?: string, operator?: WhereFilterOp, val?: any): Promise<any[]> {
   return new Promise((resolve, reject) => {
      let q;
      if (field && operator && val)
         q = query(collection(_db, collectionName), where(field, operator!, val));
      else
         q = collection(_db, collectionName);

      getDocs(q)
         .then(queryResult => {
            const list = <object[]>queryResult.docs.map(doc => {
               const data = doc.data();
               data.id = doc.id;
               return data;
            });
            resolve(list || []);
         })
         .catch(err => {
            reject(err);
         });
   });
}

/*
   After binding listener, onChange will be fired
   immediately with state 'added' for all matching items.
   As of Oct 22, Node.js implementation of firesotre SDK doesn't have pendingWrite feature.
 */
function attachListenerOnCollection(collectionName: string, field: string, operator: WhereFilterOp, val: any, onChange: (data: any) => void, onError: (errorData: any) => void): any {
   const q = query(collection(_db, collectionName), where(field, operator, val));
   const unsubscribe = onSnapshot(q,
      querySnapshot => {
         const list = <object[]>[];
         querySnapshot.docChanges().forEach((res) => {
            const data = res.doc.data();
            data.id = res.doc.id;
            list.push({ state: res.type, doc: data });
         });
         onChange({ docs: list, pending: querySnapshot.metadata.hasPendingWrites });
      },
      error => {
         onError({ message: `Error occurred on ${collectionName} listener. [${error.message}]`, error: toJsonObject(error) });
      }
   );

   return unsubscribe;
}

function getById(collectionName: string, docId: string): Promise<any> {
   return new Promise((resolve, reject) => {
      const docRef = doc(_db, collectionName, docId);
      getDoc(docRef)
         .then(docSpapshot => {
            let data = null;
            if (docSpapshot.exists()) {
               data = docSpapshot.data();
               data.id = docSpapshot.id;
            }
            resolve(data);
         })
         .catch(err => {
            reject(`Error occurred while getting data. Document name: ${collectionName} [${err.message}]`);
         });
   });
}

/*
   After binding listen, onChange will be fired immediately.
   Single document binder doesn't have a stete (type) porperty.
   As of Oct 22, Node.js implementation of firesotre SDK doesn't have pendingWrite feature.
*/
function attachListenerOnDocument(collectionName: string, docId: string, skipFirst: boolean | undefined, onChange: Function, onError: Function): any {
   const unsub = onSnapshot(doc(_db, collectionName, docId),
      (doc) => {
         if (skipFirst === true) {
            skipFirst = undefined;
            return;
         }

         onChange(prepareTheDoc(doc));
      },
      error => onError({ message: `Error occurred on document listener. Collection: ${collectionName}, ID: ${docId}.`, error: toJsonObject(error) }));

   return unsub;
}

function create(collectionName: string, data: any, docId?: string): Promise<string> {
   return new Promise((resolve, reject) => {
      try {
         const promise = docId ?
            setDoc(doc(_db, collectionName, docId!), data) :
            addDoc(collection(_db, collectionName), data);

         promise
            .then((docRef: any) => { resolve(docRef ? docRef.id : ''); })
            .catch((error: any) => { reject({ message: `Error occurred while creating document. [collection: ${collectionName}, id: '${docId}', doc: ${JSON.stringify(data)}]`, error: toJsonObject(error) }); });
      }
      catch (error:any) {
         reject({ message: `Error occurred while setting document for creating. [collection: ${collectionName}, id: '${docId}', doc: ${JSON.stringify(data)}]`, error: toJsonObject(error) });
      }
   });
}

function update(collectionName: string, docId: string, data: any): Promise<null> {
   return new Promise((resolve, reject) => {
      try {
         updateDoc(doc(_db, collectionName, docId), data)
            .then(() => resolve(null))
            .catch(error => reject({ msg: `Error on updating a record in ${collectionName}, ID: ${docId}.`, error: error }));
      }
      catch (error:any) {
         reject({ msg: `Error from update try-catch. Collection ${collectionName}, ID: ${docId}.`, error: error })
      }
      
   });
}

/*
timestamp fields with every doc (js):
  _readTime: Timestamp { _seconds: 1667069775, _nanoseconds: 928085000 },
  _createTime: Timestamp { _seconds: 1667036376, _nanoseconds: 570482000 },
  _updateTime: Timestamp { _seconds: 1667036376, _nanoseconds: 570482000 }
*/
function prepareTheDoc(doc: DocumentSnapshot<DocumentData>) {
   const document: any = doc.data();
   document.id = doc.id;
   // document._readTime = doc._readTime.toDate();
   // document._createTime = doc._createTime.toDate();
   // document._updateTime = doc._createTime._nanoseconds === doc._updateTime._nanoseconds ? null : doc._updateTime.toDate();

   //document.keys.forEach(k => document[k] instanceof Timestamp ? document[k] = document[k].toDate() : null);
   for (const key in document) {
      if (Object.hasOwnProperty.call(document, key) && document[key] instanceof Timestamp) {
         document[key] = document[key].toDate();
      }
   }

   return document;
}

function toJsonObject(obj: object): object {
   return JSON.parse(JSON.stringify(obj, Object.keys(obj)));
}


/*********** Authorization ************/

function registerAuthStateChanged(callback:Function, perpetual:boolean, callerName:string) {
   try {
      const unsubscribe = onAuthStateChanged(_auth, (user:any|null) => {
         //console.log(callerName, `perpetual:`, perpetual); // Don't delete
         callback(user);
         if(!perpetual)
            unsubscribe();
      },
      () => {
         //console.log('state error', error, new Date().toJSON());
         callback(false);
      });

      return unsubscribe;
   }
   catch (error) {
      alert('Error occurred while registering to authentication state; but you will still able to contunue to use the App.');
   }
}

function googleSignIn(locale?:string) {
   return new Promise((resolve, reject) => {
      console.log({GoogleAuthProvider});
      const _siginProvider = new GoogleAuthProvider();
      if(locale)
         _auth.languageCode = locale;

      signInWithRedirect(_auth, _siginProvider, browserPopupRedirectResolver)
         .then(() => resolve(null))
         .catch(error => reject(error));
   });
}

function signOutTheUser() {
   new Promise((resolve, reject) => {
      signOut(_auth)
         .then(() => resolve(null))
         .catch(() => reject());
   });
}

function isAuthenticated() : Promise<boolean> {
   return new Promise((resolve, reject) => {
      try {
         registerAuthStateChanged((user:any) => resolve(!!user),
            false,
            'service > isAuthenticated');
      }
      catch (error) {
         reject(error);
      }
   });
}

function isAuthorized(roleName:string) : Promise<boolean> {
   return new Promise((resolve, reject) => {
      registerAuthStateChanged(
         (user:any|null) => {
            if(!user)
               resolve(false);
            else {
               getById(DB.Collections.roles, roleName)
                  .then((data:any) => {
                     const flag = data ? data.users.includes(user.uid2) : false;
                     resolve(flag);
                  })
                  .catch((err:any) => {
                     reject(err);
                  });
            }
         },
         false,
         'service > isAuthorized');
   });
}

function checkForRedirectSignIn() : Promise<any> {
 return new Promise((resolve, reject) => {
   getRedirectResult(_auth, browserPopupRedirectResolver)
      .then((result: any|null) => {
         // This gives you a Google Access Token. You can use it to access Google APIs.
         // const credential: OAuthCredential | null = GoogleAuthProvider.credentialFromResult(result);
         //const token = credential?.accessToken;

         // The signed-in user info.
         // const user = result.user;

         resolve(result)
      })
      .catch(reject);
 }); // new promise
}

const firestoreService = {
   getCollection,
   attachListenerOnCollection,
   getById,
   attachListenerOnDocument,
   create,
   update,
   registerAuthStateChanged,
   googleSignIn,
   signOutTheUser,
   isAuthenticated,
   isAuthorized,
   checkForRedirectSignIn
};

export { firestoreService, DB };
