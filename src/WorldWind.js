// Initialize the WorldWind globe
var wwd = new WorldWind.WorldWindow("global");

// Add base layers
wwd.addLayer(new WorldWind.BMNGOneImageLayer());
wwd.addLayer(new WorldWind.BMNGLandsatLayer());

// Add additional layers for user interface
wwd.addLayer(new WorldWind.CompassLayer());
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

// Check if Geolocation API is available
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            // Get user's coordinates
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            // Center the globe to the user's location
            wwd.navigator.lookAtLocation.latitude = latitude;
            wwd.navigator.lookAtLocation.longitude = longitude;
            wwd.navigator.range = 1e7; // Adjust zoom level (optional)

            // Add a placemark for the user's location
            var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
            placemarkAttributes.imageSource = WorldWind.configuration.baseUrl + "images/pushpins/plain-red.png";
            placemarkAttributes.imageScale = 0.8;

            var placemarkPosition = new WorldWind.Position(latitude, longitude, 0);
            var placemark = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);

            var placemarkLayer = new WorldWind.RenderableLayer("User Location");
            placemarkLayer.addRenderable(placemark);
            wwd.addLayer(placemarkLayer);

            console.log("User location loaded: Latitude " + latitude + ", Longitude " + longitude);
        },
        function (error) {
            console.error("Geolocation error: ", error);
            alert("Unable to access your location. Please ensure location services are enabled.");
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
    alert("Geolocation is not supported by your browser.");
}
