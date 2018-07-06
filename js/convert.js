
let converter = new Converter()
converter.getAllCurrencies()
converter.showCachedCurrencies()
 

function convert(){
    let currentCurrency = document.getElementById("currentCurrencyList").value;
    let destinationCurrency = document.getElementById("destinationCurrencyList").value;
    let value = document.getElementById("value").value;

    let query = currentCurrency+"_"+destinationCurrency

    converter.getConversionRate(currentCurrency, destinationCurrency).then( response =>{ 
        const rate = response.currencyRate;
        const appStatus = response.appStatus;

        if(rate !== undefined){
            document.getElementById("displayValue").innerHTML = rate * value
             if(appStatus ==='online') converter.addCurrencyRateToCache(rate, currentCurrency, destinationCurrency)
        }
        else 
            console.log("unable to convert")
    }).catch( error => {
        console.log('No rate was found in the cache: ');
        document.getElementById("displayValue").innerHTML = "Can not convert. You seem to be offline"
    });
}