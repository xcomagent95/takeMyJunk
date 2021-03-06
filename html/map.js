// Initialize the map and set coordinates and zoom
var map = L.map('map').setView([51.96, 7.63], 12);

// Add tile layer with map from OpenStreetMap
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var drawnItems = new L.FeatureGroup().addTo(map);
var drawControl = new L.Control.Draw({
         draw: {
            polygon: false,
            circle: false,
            circlemarker: false,
            polyline: false,
            rectangle: false
            },
        edit: {
            featureGroup: drawnItems,
            edit: false,
            remove: false
        }
    }).addTo(map);

    map.on('draw:created', function (e) {
        var tempMarker = e.layer.addTo(map);
        var coordinates = e.layer._latlng;
        var popupOptions ={
            'maxHeight': 300,
            }
        var popupContent =  `<div>   
                            <div>
                            <form id="addBoxForm" action="/add/addBox" method="post">
                                <br></br>
                                <label for="Name">Name</label><br>
                                <input id="Name" name="name"><br>
                                <label for="Kommentar">Commentary</label><br>
                                <input id="Kommentar" name="commentary"><br>
                                <label for="Datum">Date</label><br>
                                <input id="Datum" name="date" type="date"><br>
                                <label for="Strasse">Street</label><br>
                                <input id="Strasse" name="street"><br>
                                <label for="Hausnummer">House Number</label><br>
                                <input id="Hausnummer" name="house_number"><br>
                                <input type="hidden" id="items" name="items" size="40"><br>
                                <label for="Koordinaten">Coordinates</label><br>
                                <input id="Koordinaten" name="coordinates" value="[` + coordinates.lng.toFixed(2) + `,` +  coordinates.lat.toFixed(2) + `]" readonly>'
                                <input type="submit" value="Add Box">
                            </form> 
                            <div>
                                <table id="itemsTable" class="table">
                                    <thead>
                                        <tr>
                                            <br>
                                            <th scope="col">Name</th>
                                            <th scope="col">Desciption</th>
                                        </tr>
                                    </thead>
                                    <tBody id="itemsTableBody"></tBody>
                                </table>    
                            </div>
                            <label for="itemName">Name</label><br>
                            <input id="itemName" name="street"><br>
                            <label for="descr">Description</label><br>
                            <input id="descr" name="descr"><br>
                            <button type="button" value="Add Item to Box" onclick="getItemFromForm()">Add Item</button>
                            </div>`;    
        tempMarker.bindPopup(popupContent, popupOptions,{
            keepInView: true,
            closeButton: true
            }).openPopup(); 
        map.addLayer(tempMarker);
    });


var boxes
function getBoxes() { 
    {$.ajax({ //handle request via ajax
        url: "/search/getBoxes", //request url is the prebuilt request
        method: "GET", //method is GET since we want to get data not post or update it
        async: false //function does not return immediately, but has effect on a warning alert in the console
        })
        .done(function(res) { //if the request is done -> successful
            boxes = res; //retrieve boxes from response
            return;
        })
        .fail(function(xhr, status, errorThrown) { //if the request fails (for some reason)
            return;
        })
        .always(function(xhr, status) { //if the request is "closed", either successful or not 
            return; 
        })
    }
}  
getBoxes()

function addBoxMarker () {
    var lat;
    var long;
    var marker;
    var popupBoxContent;
    var items;
    var boxIcon = L.icon({
        iconUrl: 'marker100p.png',
        iconSize:     [32, 37], // size of the icon
        iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
    });
    for ( var i = 0; i<boxes.length;i++) {
        lat = boxes[i].obj.features[0].geometry.coordinates[1];
        long = boxes[i].obj.features[0].geometry.coordinates[0];
        marker = new L.marker([lat, long], {icon: boxIcon}).addTo(map);
        // get array with items
        items = boxes[i].items;
        //var itemsNames = [items[0].name];
        // extract only names from items and save in array
        //for (var j=0; j<items.length; j++) {
            //if (j != 0) {
            //itemsNames = [itemsNames, items[j].name];
            //}
        //};
        var itemsString = JSON.stringify(boxes[i].items)
        var itemNames = " "
        for ( var j = 0; j<boxes[i].items.length;j++) {
            itemNames += boxes[i].items[j].name +  ' ,'
        }
        console.log(itemNames)
        var popupOptions ={
            'maxHeight': 300,
            }

        popupBoxContent = "<b>Name: </b>" +boxes[i].name +
                        "<br> <b>Commentary: </b>" + boxes[i].obj.features[0].properties.commentary+
                        "<br> <b>Date: </b>" + boxes[i].obj.features[0].properties.date+
                        "<br> <b>Street: </b>"+boxes[i].obj.features[0].properties.street+
                        "<br> <b>Street Number: </b>"+boxes[i].obj.features[0].properties.house_number+
                        "<br> <b>Items: </b>"+itemNames.slice(0, -1)+
                        "<input id='key' type='hidden' value="+ boxes[i].key+"></input>"+
                        "<input id='itemsList' type='hidden' value='" + itemsString + "'></input>"+
                        "<input id='boxName' type='hidden' value='" + boxes[i].name + "'></input>"+
                        "<br>"+
                        "<input id='userKey'></input>"+
                        "<button type='button' value='Item zu Box hinzufuegen' onclick='unlockBox()'>Unlock Box</button>"+
                        "<br>"+
                        "<div id='info'></div>"
                        '<form id="removeBoxForm" action="/delete/removeBox" method="post">\
                        <br><label for="fname">Name</label><br>\
                        <input id="Name" name="name"><br>\
                        <input type="submit" value="L??schen">\
                        </form>'+
                        '<form id="updateBoxForm" action="/update/updateBox" method="post">\
                        <br><label for="oldName">editiertes Objekt</label><br>\
                        <input id="oldName" name="oldName"><br>\
                        <label for="newName">Neuer Name</label><br>\
                        <input id="newName" name="newName"><br>\
                        <input type="submit" value="Aktualisieren">\
                        </form>';
        marker.bindPopup(popupBoxContent, popupOptions);
    }
}
addBoxMarker();

function getItemFromForm() {
    var itemName = document.getElementById("itemName").value
    var description = document.getElementById("descr").value
    
    var existingItems = document.getElementById("items").value
    var newItems = existingItems + '{"name":"' + itemName + '", "description":"' + description + '"},'

    document.getElementById("items").value = newItems
    buildItemTable()
}

function deleteItemFromTable(i){
    var items = JSON.parse('[' + document.getElementById("items").value.slice(0, -1) + ']')
    items.splice(i, 1)
    document.getElementById("items").value = ""
    var string = ""
    for(var i = 0; i < items.length; i++) { //iterate over table data
        string += JSON.stringify(items[i])
        string += ','    
    }
    document.getElementById("items").value += string 
    buildItemTable()
}

function buildItemTable() {
    //console.log(document.getElementById("items").value)
    var items = JSON.parse('[' + document.getElementById("items").value.slice(0, -1) + ']')
    var table = document.getElementById('itemsTableBody'); //get the the table containing the locations
    table.innerHTML = ""
    for(var i = 0; i < items.length; i++) { //iterate over table data
        //initialize table row as variable
        var row =  `<tr scope="row">
                        <td>${items[i].name}</td>
                        <td>${items[i].description}</td>
                        <td><button type="button" onclick="deleteItemFromTable(` + i + `)">delete Item</button></td>
                    </tr>`
        table.innerHTML += row; //pass row into given table
    }
}

function updateItemsinBox(){

}

function unlockBox() {
    var key = document.getElementById('key').value
    var userKey = document.getElementById('userKey').value

    if(key == userKey) {
        document.getElementById('info').innerHTML = `<div>
        <table id="itemsTable" class="table">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Beschreibung</th>
                </tr>
            </thead>
            <tBody id="itemsUpdateTableBody"></tBody>
        </table>   
        <form action="/update/removeItemfromBox" method="post">
            <input type='hidden' id="boxName" name="boxName" value='` + document.getElementById("boxName").value + `'><br>
            <input type='hidden' id="newItems" name="newItems" value='` + document.getElementById("itemsList").value + `'><br>
            <input type="submit" value="Udate">
        </form>
      </div>`

    var items = JSON.parse(document.getElementById("itemsList").value)
    console.log(items)
    var table = document.getElementById('itemsUpdateTableBody'); //get the the table containing the locations
    for(var i = 0; i < items.length; i++) { //iterate over table data
        //initialize table row as variable
        var row =  `<tr scope="row">
                        <td>${items[i].name}</td>
                        <td>${items[i].description}</td>
                        <td><button type="button" onclick="takeItems(` + i + `)">take Item</button></td>
                    </tr>`
        table.innerHTML += row; //pass row into given table
    }
    } 
    else {
        document.getElementById('info').innerHTML = "Oh boy! You seem to be a Stranger round here...better get lost!"
    }
}

function takeItems(i) {
    console.log(i)
    var items = JSON.parse(document.getElementById("itemsList").value)
    items.splice(i, 1)
    console.log(items)
    document.getElementById("itemsList").value = JSON.stringify(items) 


    var table = document.getElementById('itemsUpdateTableBody'); //get the the table containing the locations
    table.innerHTML = ""
    for(var i = 0; i < items.length; i++) { //iterate over table data
        //initialize table row as variable
        var row =  `<tr scope="row">
                        <td>${items[i].name}</td>
                        <td>${items[i].description}</td>
                        <td><button type="button" onclick="takeItems(` + i + `)">take Item</button></td>
                    </tr>`
        table.innerHTML += row; //pass row into given table
    }
    document.getElementById("newItems").value = document.getElementById("itemsList").value
}