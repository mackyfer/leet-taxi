Meteor.startup(function() {
  GoogleMaps.load({
    key: 'AIzaSyDvHRa-ztBgMcI6muBwBS2-FJdP9PWKlPg',
    libraries: 'places'  // also accepts an array if you need more than one
  });
});