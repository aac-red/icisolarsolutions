# Solar Solutions - Innovative Controls

Open `index.html` in a browser (double-click works, or host the whole folder on any web server).
Needs internet only for the three.js library (loaded from cdnjs).

## Structure
```
index.html          wrapper page with the Solar Panels / Solar Inverters tabs
panels.html         Solar Panels page
inverters.html      Solar Inverters page
css/
  base.css          styles shared by panels + inverters pages
  index.css         wrapper (tab bar)
  panels.css        panels page only
  inverters.css     inverters page only
js/
  index.js          tab switching, loads panels.html / inverters.html in iframes
  frame-resize.js   lets each page tell the wrapper its height
  panels-3d.js      3D solar panel viewer
  inverters-3d.js   3D inverter model viewer
  inverters-catalog.js  category tabs, thumbnails, spotlight
  inverter-data.js  <-- THE INVERTER LIST (names, kW, image file)
images/inverters/   <-- the product photos (normal PNG files, no base64)
```

## Updating inverter photos / models
- **Replace a photo:** overwrite the file in `images/inverters/<category folder>/` with the same file name.
- **Add a model:** put the new image in the matching folder, then add one line in `js/inverter-data.js`.
- **Remove a model:** delete its line in `js/inverter-data.js` (and the image if you like).
- **Change the phone number / links:** search for `+63 919 999 0748` in `panels.html` and `inverters.html`.
