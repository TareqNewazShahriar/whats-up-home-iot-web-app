import { initializeApp } from 'firebase/app';
import { getFirestore, Timestamp, collection, getDoc, addDoc, updateDoc, query, where, type WhereFilterOp, getDocs, onSnapshot, doc, CollectionReference, DocumentSnapshot, type DocumentData, setDoc, DocumentReference } from 'firebase/firestore';

const DB = {
   Collections: { values: 'values', faces: 'faces', logs: 'logs' },
   Roles: { programmer: 'programmer', user: 'user' },
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
function getCollectionWithListener(collectionName: string, field: string, operator: WhereFilterOp, val: any, onChange: (response: any) => void): any {
   const q = query(collection(_db, collectionName), where(field, operator, val));
   const unsubscribe = onSnapshot(q,
      querySnapshot => {
         const list = <object[]>[];
         querySnapshot.docChanges().forEach((res) => {
            const data = res.doc.data();
            data.id = res.doc.id;
            list.push({ state: res.type, doc: data });
         });
         onChange({ success: true, data: list, pending: querySnapshot.metadata.hasPendingWrites });
      },
      err => {
         onChange({ success: false, errorMessage: `Error occurred on ${collectionName} listener. [${err.message}]` });
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
         console.log('woooo', new Date());
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


const firestoreService = {
   getCollection,
   getCollectionWithListener,
   getById,
   attachListenerOnDocument,
   create,
   update
};

export { firestoreService, DB };
