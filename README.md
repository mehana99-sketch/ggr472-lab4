# GGR472 Lab 4: Incorporating GIS analysis into web maps using Turf.js

## Repository Contents
- `data/pedcyc_collision_06-21.geojson`: Data file containing point locations of road collisions involving pedestrian and cyclists between 2006 and 2021 in Toronto 
- `instructions/GGR472_Lab4`: Instructions document explaining steps required to complete the lab
- `index.html`: HTML file to render the map
- `style.css`: CSS file for positioning the map interface
- `script.js`: JavaScript file template to be updated to include code that creates and visualizes and hexgrid map based on the collision data

## Tasks
- Created empty variable, used fetch to fill it.
- Loaded map, added sources and layers.
- Created bounding box using 'turf.envelope()'
    - Resized bounding box using 'turf.transformScale()'
    - Got usable array (for hexgrid) using 'turf.bbox()'
- Created hexgrid using 'turf.hexGrid()'
- Aggregated collision data (count) for each hexagon 
- Used a loop to iteratively find polygon with most collisions
- Practiced 'console.log()' to search for values and test code
    - Note: code is commented out, but I left it there for future reference
- Further customization: 
    - Mouse symbol change when hovering over polygons
    - Fullscreen, navigation control
    - Hexgrid:
        - Reduced opacity, increased hexagon size
        - Interpolated colour intensity for COUNT values between 1 and 122 (122 is maximum count)
        - in 'addLayer', filtered out polygons where COUNT = 0
        - Changed opacity to highlight based on hover (needed paint change and event listener)
    - Checkboxes for each layer's visibility
    - Mixed legend styles:
        - Added gradient bar for interpolated polygon symbology
        - Point for collision sites

- pop-ups
- css styling
- index.html changes

## Issues
- How can I easily check the parameters for each tool? I'm still not exactly sure why 'turf.bbox()' works on transformed data, but 'variable.bbox()' doesn't.
- Managing the two map styles together was so tiresome and complicated; I want to learn how to do it the right way
