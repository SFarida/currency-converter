class Converter {
    constructor() {
        this.init()
        this.dbPromise = this.openDatabase();
        this.getAllCurrencies();
    }

    init() {
        // check if Sevice Worker support exist in browser or not
        if( 'serviceWorker' in navigator ) {
            navigator.serviceWorker.register( 'service-worker.js' , { scope : ' ' } ).then( function( ) { 
                                    console.log('Service Worker Registered');
                                })
                                .catch( function( err) {
                                    console.log(`Aagh! Some kind of Error :- ${err}`);
                                });
        } 
        else    
            console.log("browser does not support service worker!!")
    }

    openDatabase() {
        if (!('indexedDB' in window)) {
            console.log('This browser doesn\'t support IndexedDB');
            return Promise.resolve();
          }
        
          return idb.open('converterIdb', 4, upgradeDb => {
                switch(upgradeDb.oldVersion) {
                    case 0:
                        upgradeDb.createObjectStore('currencies');
                    case 2:
                        upgradeDb.transaction.objectStore('currencies').createIndex('id', 'id', {unique: true});
                    case 3:
                        upgradeDb.createObjectStore('currencyRates', {keyPath: 'query'});
                        upgradeDb.transaction.objectStore('currencyRates').createIndex('query', 'query', {unique: true});
                }
         });
    }
    
    addCurrenciesToCache(currencies) {
        this.dbPromise.then(db => {
            if (!db) return;
            
            let tx = db.transaction('currencies', 'readwrite'); // create a transaction 
            let store = tx.objectStore('currencies'); // access currencies the object store
            // loop through the currencies object and add them to the currencies object store
            for (const currency of currencies) {
                store.put(currency, currency.id);
            }
           // return tx.complete;

            // limit store to 160 items
            store.index('id').openCursor(null, "prev").then(cursor => {
                return cursor.advance(160);
            }).then(function deleteRest(cursor) {
                if (!cursor) return;
                cursor.delete();
                return cursor.continue().then(deleteRest);
            });
        }).then(() => {
            console.log('list of currencies added to cache (db)');
         }).catch(error => console.log('Something went wrong: '+ error));
    }
    
    addCurrencyRateToCache(rate, fromCurrency, toCurrency) {
        this.dbPromise.then(db => {
            if (!db) return;
            
            let tx = db.transaction('currencyRates', 'readwrite'); // create a transaction 
            let store = tx.objectStore('currencyRates'); // access currency rate object stores

            let query = `${fromCurrency}_${toCurrency}`;
            // add the new entry or replace old entry with new one
            store.put({ query, rate });

            // limit store to 50 items
           store.index('query').openCursor(null, "prev").then(cursor => {
                return cursor.advance(50);
            }).then(function deleteRest(cursor){
                if (!cursor) return;
                cursor.delete();
                return cursor.continue().then(deleteRest);
            });
        }).then(() => {
            console.log('Currency rate for ' + fromCurrency + ' and ' + toCurrency + ' added to cache');
         }).catch(error => console.log('Something went wrong: '+ error));
    }
    
    getCurrencyRateFromCache(fromCurrency, toCurrency) {
       console.log("fetching form cahce...")
       return this.dbPromise.then(db => {
            if (!db) return;

            const query = `${fromCurrency}_${toCurrency}`;
            let tx = db.transaction('currencyRates', 'readwrite'); // create a transaction 
            let store = tx.objectStore('currencyRates'); // access currency rate object stores

           return store.index('query').get(query);
        }).then( RateObj => { 
                   const currencyRate  = RateObj.rate;
                    return {currencyRate, appStatus: 'offline'}; // return the currency rate value
         }).catch(error => {
             console.log('Sorry! No rate was found in the cache:', error);
             return null;
        });
    }

    getConversionRate(fromCurrency, toCurrency) {
        fromCurrency = encodeURIComponent(fromCurrency);
        toCurrency = encodeURIComponent(toCurrency);
        let query = fromCurrency + '_' + toCurrency;

        return fetch('https://free.currencyconverterapi.com/api/v5/convert?q='+ query + '&compact=ultra').then(response => {
            return response.json();
        }).then(response => {
            const currencyRate = response[Object.keys(response)]; // get the conversion rate 
            return  {currencyRate, appStatus: 'online'};
        }).catch(error => {
            const currencyRate = this.getCurrencyRateFromCache(fromCurrency, toCurrency);
            return  currencyRate;
        });
    }
    
    showCachedCurrencies() {
        return this.dbPromise.then( db => {
            if (!db) return;
        
            let index = db.transaction('currencies')
              .objectStore('currencies').index('id');
        
            return index.getAll().then( currencies => {
                console.log('Currencies fetched from cache');

                let selectFields = document.querySelectorAll('select.currency');

                //loop through the returned currencies from the cache
                
                for (let currency of currencies){
                    document.getElementById("currentCurrencyList").innerHTML += 
                        "<option value=\""+currency.id+"\">"+
                        currency.currencyName+" ("+
                        currency.currencySymbol+") "
                        "</option>";

                    document.getElementById("destinationCurrencyList").innerHTML += 
                        "<option value=\""+currency.id+"\">"+
                        currency.currencyName+" ("+
                        currency.currencySymbol+") "
                        "</option>";
                }
                
            });
          });
    }
    
    getAllCurrencies() {
        fetch('https://free.currencyconverterapi.com/api/v5/currencies').then(response => {
            return response.json();
        }).then(response => {
            let currencies = Object.values(response.results);
            this.addCurrenciesToCache(currencies); 
           
        }).catch( error => {
            console.log(' Unable to get all currencies from network: '+ error);
            this.showCachedCurrencies(); // get currencies from cache since user is offline.
        });
    }
} 