/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWVoYW5hLW4iLCJhIjoiY21rb2Zxb24wMDVvbzNlcHhhNGwxc3ZpOCJ9.cldXiKJrisAMpXXAL0qobg'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mehana-n/cmms6h4kb000q01rxe1upbi9k',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
});

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable

let injurygeojson; //CREATE EMPTY VARIABLE
fetch('https://raw.githubusercontent.com/mehana99-sketch/ggr472-lab4/refs/heads/main/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json()) // Transforms response into JSON
    .then(response => {
        console.log(response); // Check response in console (f12 on web)
        injurygeojson = response; // store geoJSON as variable from URL (fetched)
    });

map.on('load', () => {
    map.addSource('injury-points', {
        type : 'geojson',
        data : injurygeojson // I could put the raw URL here, but I need it to be a separate variable for turf.js
    });
    map.addLayer({
        'id' : 'Accidents',
        'type' : 'circle',
        'source' : 'injury-points',
        'paint' : {
            'circle-radius' : 3,
            'circle-color' : 'pink'
        }
    });
});


/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function
//      **Option: You may want to consider how to increase the size of your bbox to enable greater geog coverage of your hexgrid
//                Consider return types from different turf functions and required argument types carefully here



/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
//      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty



// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows


