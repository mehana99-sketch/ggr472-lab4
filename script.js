// 1. INITALIZE MAP

// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWVoYW5hLW4iLCJhIjoiY21rb2Zxb24wMDVvbzNlcHhhNGwxc3ZpOCJ9.cldXiKJrisAMpXXAL0qobg'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mehana-n/cmms6h4kb000q01rxe1upbi9k',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
});

// Create variable for GeoJson point data

let injurygeojson; // create EMPTY variable
fetch('https://raw.githubusercontent.com/mehana99-sketch/ggr472-lab4/refs/heads/main/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json()) // Transforms response into JSON
    .then(response => {
        //console.log(response); // Check response in console (f12 on web)
        injurygeojson = response; // store geoJSON as variable from URL (fetched)
    });

// 2. LOAD MAP

map.on('load', () => {

    // create envelope

    // must have geojson parameter
    // added 'bbox' to return array of coordinates (in format minX, minY, maxX, maxY)
    let boundingboxfeature = turf.envelope(injurygeojson);
    let boundingboxresized = turf.transformScale(boundingboxfeature, 1.1); // resize envelope
    let boundingbox = turf.bbox(boundingboxresized); // pick out array as parameter for 'turf.hexGrid'
    // I had consistent issues with 'boundingboxfeature.bbox' (didn't work after 'turf.transformScale'), had to switch to 'turf.bbox(boundingboxfeature)'

    // hexgrid

    // parameters: bbox, cellside (length of side of hexagon), options (optional parameter)
    let hexgrid = turf.hexGrid(boundingbox, 0.5, { units: "kilometers" });

    // add sources, layers

    map.addSource('injury-points', {
        type: 'geojson',
        data: injurygeojson // I could put the raw URL here, but I need it to be a separate variable for turf.js
    });
    map.addLayer({
        'id': 'Accidents',
        'type': 'circle',
        'source': 'injury-points',
        'paint': {
            'circle-radius': 3,
            'circle-color': 'pink'
        }
    });
    // add hexgrid to map
    map.addSource('hexgrid-source', {
        type: 'geojson',
        data: hexgrid
    });
    map.addLayer({
        'id': 'Tessellation',
        'type': 'line',
        'source': 'hexgrid-source'
        // automatically paints plack
    });

// 4. AGGREGATE DATA BY HEXGRID

    // collect points within each polygon
    // parameters: polygon feature collection, point feature collection, 'inProperty' (property to be nested from), 'outProperty' (property to be nested into)
    let agg_collision = turf.collect(hexgrid, injurygeojson, '_id', 'values'); // returns polygons with properties listed
    //console.log(agg_collision);

    // finding polygon with highest count of collisions
    let max_collision = 0
    agg_collision.features.forEach((feature) =>{ // forEach makes iterative
        feature.properties.COUNT = feature.properties.values.length // this creates a new field 'COUNT' in properties, and assigns a value (length of values list) for each polygon 
        if (feature.properties.COUNT > max_collision) { // iteratively tests higher value of collision count
            //console.log(feature);
            max_collision = feature.properties.COUNT // iteratively update 'max_collision' when necessary
        }
    });
    //console.log(max_collision);
    //returns 55 

    //------------------------------------------------------------------------------

    // STUDY IN UNDERSTANDING 'console.log' AND SEARCHING FOR VALUES

    //console.log(boundingbox); // return feature object, 'bbox' listed as a property
    //console.log(boundingbox.bbox); // return array property (variable.propertyname)
    //console.log(boundingbox.bbox[0]); // access specific value using index

    // UNDERSTANDING RETURN TYPES
    // create a feature collection holding the bbox feature 
    //boundingboxgeojson = {
    //    "type" : "FeatureCollection",
    //    "features" : [boundingbox] 
    //};
    //console.log(boundingboxgeojson); // this is a feature collection
    //console.log(boundingboxgeojson.features[0].geometry.coordinates[0][0][1]); // returns 43.590289
    // returns 'boundingboxgeojson' (feature collection)
    // -> 'features' (property name) 
    // -> 'Array' is a specific feature (index 0), note this is the only value in features
    // -> 'geometry' is an array property
    // -> 'coordinates' is an array property within 'geometry' array property
    // -> list of arrays from 'coordinates' (index 0)
    // -> a coordinate set in array format (index 0) 
    // -> y-coordinate: 43.590289 (index 1)
    //------------------------------------------------------------------------------------
});

// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows


