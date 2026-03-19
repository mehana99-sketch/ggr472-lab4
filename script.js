// INITALIZE MAP

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
// fetch('https://raw.githubusercontent.com/mehana99-sketch/ggr472-lab4/refs/heads/main/data/pedcyc_collision_06-21.geojson') // raw data file
fetch('https://mehana99-sketch.github.io/ggr472-lab4/data/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json()) // Transforms response into JSON
    .then(response => {
        //console.log(response); // Check response in console (f12 on web)
        injurygeojson = response; // store geoJSON as variable from URL (fetched)
    });

// LOAD MAP

map.on('load', () => {

    // Add point source and layer
    map.addSource('injury-points', {
        type: 'geojson',
        data: injurygeojson // I could put the raw URL here, but I need it to be a separate variable for turf.js
    });
    map.addLayer({
        'id': 'Accidents',
        'type': 'circle',
        'source': 'injury-points',
        'paint': {
            'circle-radius': 2,
            'circle-color': 'blue'
        }
    });

    // HEXGRID OPERATIONS

    // Create envelope
    // must have geojson parameter
    // added 'bbox' to return array of coordinates (in format minX, minY, maxX, maxY)
    let boundingboxfeature = turf.envelope(injurygeojson);
    let boundingboxresized = turf.transformScale(boundingboxfeature, 1.1); // resize envelope
    let boundingbox = turf.bbox(boundingboxresized); // pick out array as parameter for 'turf.hexGrid'
    // I had consistent issues with 'boundingboxfeature.bbox' (didn't work after 'turf.transformScale'), had to switch to 'turf.bbox(boundingboxfeature)'

    // Create hexgrid
    // parameters: bbox, cellside (length of side of hexagon), options (optional parameter)
    let hexgrid = turf.hexGrid(boundingbox, 0.8, { units: "kilometers" });

    // Aggregate data by hexgrid
    // collect points within each polygon
    // parameters: polygon feature collection, point feature collection, 'inProperty' (property to be nested from), 'outProperty' (property to be nested into)
    let agg_collision = turf.collect(hexgrid, injurygeojson, '_id', 'values'); // returns polygons with properties listed
    //console.log(agg_collision);

    // Find polygon with highest count of collisions
    let max_collision = 0
    agg_collision.features.forEach((feature) => { // forEach makes iterative
        feature.properties.COUNT = feature.properties.values.length // this creates a new field 'COUNT' in properties, and assigns a value (length of values list) for each polygon 
        if (feature.properties.COUNT > max_collision) { // iteratively tests higher value of collision count
            //console.log(feature);
            max_collision = feature.properties.COUNT // iteratively update 'max_collision' when necessary
        }
    });
    //console.log(max_collision);
    //returns 122 (was 55 until I made the hexagons bigger) 

    // Add and style hexgrid
    map.addSource('agg_collision', {
        type: 'geojson',
        data: hexgrid,
        'generateId': true // Create a unique ID for each feature
    });
    map.addLayer({
        'id': 'Tessellation',
        'type': 'fill',
        'source': 'agg_collision',
        'paint': {
            'fill-color': [
                'interpolate', // adjust polygon rgb colour based on count
                ['linear'], ["get", 'COUNT'],
                1, 'rgb(255, 215, 255)',
                20, 'rgb(255, 127, 242)',
                50, 'rgb(255, 0, 230)',
                122, 'rgb(177, 0, 159)'],
            'fill-opacity': [
                'case', ['boolean', ['feature-state', 'hover'], false], 1, 0.5]
            , // CASE and FEATURE STATE expression sets opactity as 0.5 when hover state is false and 1 when updated to true
            'fill-outline-color': 'white'
        }, 'filter': ['>', ['get', 'COUNT'], 0] // filter out points where COUNT = 0
    }, 'Accidents'); // paints below accidents point layer
});

// EXTRA MAP CUSTOMIZATION

// Add map controls
map.addControl(new mapboxgl.FullscreenControl(), 'top-left');
map.addControl(new mapboxgl.NavigationControl(), 'top-left');
// These are automatically placed on top

// Change mouse symbolization on hexagons
map.on('mouseenter', 'Tessellation', () => {
    map.getCanvas().style.cursor = 'pointer'; // Switch cursor to pointer when mouse is over POI
    map.on('mouseleave', 'Tessellation', () => {
        map.getCanvas().style.cursor = ''; // Switch cursor back when leaving POI
    });
});

// Layer toggles
// Hexgrid toggle
document.getElementById('hexlayercheck').addEventListener('change', (e) => {
    if (e.target.checked) {
        map.setLayoutProperty('Tessellation', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('Tessellation', 'visibility', 'none');
    }
})
// Collision point toggle
document.getElementById('colllayercheck').addEventListener('change', (e) => {
    if (e.target.checked) {
        map.setLayoutProperty('Accidents', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('Accidents', 'visibility', 'none');
    }
})

// Highlight hexagon on mouse hover
let hexID = null
map.on('mousemove', 'Tessellation', (e) => {
    // Set hover feature state back to false to remove opacity from previous highlighted polygon
    map.setFeatureState(
        { source: 'agg_collision', id: hexID },
        { hover: false }
    );
    hexID = e.features[0].id; // Update hexID to featureID
    map.setFeatureState(
        { source: 'agg_collision', id: hexID },
        { hover: true } // Update hover feature state to TRUE to change opacity of layer to 1
    );
});
// If mouse leaves the geojson layer, set all hover states to false and provID variable back to null
map.on('mouseleave', 'Tessellation', () => {

    map.setFeatureState(
        { source: 'agg_collision', id: hexID },
        { hover: false }
    );
    hexID = null;
}); 

// Popups on click event
map.on('click', 'Tessellation', (e) => {
    //console.log(e);     // e is the event info triggered and is passed to the function as a parameter (e)
    new mapboxgl.Popup() // Declare new popup object on each click
        .setLngLat(e.lngLat) // Use method to set coordinates of popup based on mouse click location
        .setHTML("<h6> Hexagon Statistics </h6>"+ "<b>Number of collisions: </b> " + 
            e.features[0].properties.COUNT + '<br>' // Use click event properties to write text for popup
        + "<b>Collision density: </b>" + ((e.features[0].properties.COUNT)/1.66277).toFixed(2) + " per km") // Compute collision density and round to 2 decimal places
        .addTo(map); // Show popup on map
});


//(section kept for future use)------------------------------------------------------------------------------

// STUDY IN UNDERSTANDING 'console.log' AND SEARCHING FOR VALUES

//map.on('load', () => {
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
//});
