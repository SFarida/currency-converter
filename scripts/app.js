//console.log('I am here already');
// loading the currencies from the api
let from = document.getElementById("currency_from");
let to = document.getElementById("currency_to");
function getCurrency()
   {
        fetch("https://free.currencyconverterapi.com/api/v5/currencies")
        .then(response => 
        {
            response.json().then((jsonData) => {

                //This data variable corresponds to a list of all the currencies
                let currencies = jsonData.results;
                //console.log(currencies);
                
                //Looping through it here and add to dropdown
                for(let currency in currencies){
                    let option = document.createElement("option");
                    option.text = currency;
                    from.add(option, from[0]);
                }
                for(let currency in currencies){
                    let option = document.createElement("option");
                    option.text = currency;
                    to.add(option, to[0]);
                }
            }
        )})
        .catch(error => console.log(error));
   }
   getCurrency()



// Calculating the resulting amount
function calculateCurrency(){
    from = document.getElementById("currency_from").value;
    to = document.getElementById("currency_to").value;
    let query = from + '_' + to;
    let amount = document.getElementById("amt").value;
    //let displayResult = document.getElementById("converted_result");
    const url = "https://free.currencyconverterapi.com/api/v5/convert?q="
    fetch(url + query + '&compact=y&')
    .then(response => {
        return response.json();
    }).then(response => {
        document.getElementById("converted_result").innerHTML = amount * response[query]
    })
        .catch(error => console.log(error));
}

/*
.then(response => 
        {
            response.json().then((jsonData) => {
                document.getElementById("converted_result").innerHTML = amount * jsonData[query]
                console.log(document.getElementById("converted_result").innerHTML = amount * jsonData[query])
            }
)})*/