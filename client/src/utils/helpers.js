export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
}

// Remember, IndexedDB is asynchronous and event driven. This means that if we 
// want it to be on and listening all the time, we'll have to write a lot of what-if 
// type functionality to handle all of the moving parts.
// Instead, we'll use one function that opens the database connection, creates the 
// object store (if it's the first time using it on the machine), and runs whatever 
// transaction we need to have run on a successful connection. So when we call the 
// function, we'll open the connection to the database and then connect to the object 
// store that we pass in as storeName. Then we'll perform a transaction, using the 
// method and object values to help carry it out. We also wrap the whole thing in a 
// Promise, making it a lot easier to work with IndexedDB's asynchronous nature.
export function idbPromise(storeName, method, object) {

  return new Promise((resolve, reject) => {
    // open connection to the indexed database `shop-shop` with the version of 1
    const request = window.indexedDB.open('shop-shop', 1);

    // create variables to hold reference to the database, transaction (tx), and object store
    let db, tx, store;

    // if version has changed (or if this is the first time using the database), 
    // run this method and create the three object stores.
    // Remember that with IndexedDB, the .onupgradeneeded() event only runs if the 
    // browser notices that the version number in the .open() method has changed 
    // since the last time, or if the browser has never connected to the database 
    // before and 1 is the new version. Any other time this code executes and the 
    // version is still 1, the .onupgradeneeded() will not run.
    request.onupgradeneeded = function(e) {
      const db = request.result;
      // create object store for each type of data and set "primary" key index to be the 
      // `_id` of the data
      // we only need to create the three object stores once. For each of them, we provide 
      // a name of the object store and the keyPath name. Last time, we simply let them 
      // use their built-in auto increment features. But now, we'd like to provide the 
      // actual index value we want to use for looking up data. Because that index value 
      // will be the MongoDB _id property for each product or category, it makes sense 
      // to set the keyPath name to _id.
      db.createObjectStore('products', { keyPath: '_id' });
      db.createObjectStore('categories', { keyPath: '_id' });
      db.createObjectStore('cart', { keyPath: '_id' });
    };

    // handle any errors with connecting
    request.onerror = function(e) {
      console.log('There was an error');
    };

    // on database open success
    // With this functionality in place, when the indexed database connection opens 
    // successfully, we immediately save a reference of the database to the db variable.
    request.onsuccess = function(e) {
      // save a reference of the database to the `db` variable
      db = request.result;

      // (must match one of the object store names)
      // Then we open a new transaction using the .transaction() method, passing in 
      // the object store that we want to interact with and the permissions we want 
      // in this transaction. The storeName—one of the three stores we created for 
      // the database—will be passed in as an argument in the idbPromise() function 
      // when we call it from a component.
      tx = db.transaction(storeName, 'readwrite');
      // save a reference to that object store
      // We'll save a reference to that object store so that we can perform a CRUD 
      // method on it to read, write, or update the data.
      store = tx.objectStore(storeName);

      // if there's any errors, let us know
      db.onerror = function(e) {
        console.log('error', e);
      };

      // check which value we passed into the function as a method and 
      // perform that method on the object store.
      // Here we use a switch statement to check what the value of the method is. 
      // If it's put, then we run the .put() method on the object store, overwriting 
      // any data with the matching _id value from the object and adding it if it 
      // can't find a match. If it's get, we'll simply get all data from that store 
      // and return it. Both the put and get methods will return the data to wherever 
      // we call this idbPromise() function.
      switch (method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function() {
            resolve(all.result);
          };
          break;
        // If the value is delete, we'll delete that item from the object store. This 
        // option will come in handy if users want to remove an item from the 
        // shopping cart while offline.
        case 'delete':
          // checks the quantity of the item passed in.
          // if the item's quantity is now 0, delete it from the indexedDB store.
          if(object.purchaseQuantity < 1){
            store.delete(object._id);
          }
          // If there is still at least 1 of that item still in the cart.
          // use the id to find that object in the indexedDB store and delete it.
          // then update the store with the new object that has an updated
          // purchaseQuantity property. 
          else{
            // this delete isnt really needed. see below comment.
            store.delete(object._id);
            // The .put() method works in a find-or-create fashion: if it 
            // doesn't find the data to update, it will simply add that data.
            store.put(object);
          }
          break;
        default:
          console.log('No valid method');
          break;
      }

      // when the transaction is complete, close the connection
      tx.oncomplete = function() {
        db.close();
      };
    };

  });

}
