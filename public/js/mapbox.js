/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.location);

// const displayMap = (location) => {

mapboxgl.accessToken = 'pk.eyJ1IjoibmFuYiIsImEiOiJja3V5bmgwcXYwNDBuMm5xMXFwYzAyY2F3In0.wUt44jQM1jYS52xa-jS1JA';
var map = new mapboxgl.Map({
    /* container: 'map' refers to html element with id='map' */
    container: 'map',
    style: 'mapbox://styles/nanb/ckuyo0nd6011q14nvjoay47ye',
    scrollZoom: false
    /* some mapbox options - just to see how they are - not needed for app. */
    // center: [-118.113491, 34.111745],
    // zoom: 9,
    // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    // Add popup
    new mapboxgl.Popup({
        offset: 30
    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
    }
});
// }