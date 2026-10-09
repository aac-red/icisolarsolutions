/*
 * SOLIS INVERTER CATALOG  -  edit this file to add / remove / rename models.
 *
 * Each model needs:
 *   cat   : single | three | storage | utility
 *   name  : model name shown on the page
 *   kw    : power rating label shown on the page
 *   image : path to the picture, relative to index.html / inverters.html
 *
 * To UPDATE a picture: replace the file inside images/inverters/... (keep the same file name)
 * To ADD a model: drop the new picture in the matching images/inverters/<folder>/
 *                 and add one line below.
 */
window.INVERTER_FOLDERS = {
  single: 'images/inverters/Single Phase PV Inverter',
  three: 'images/inverters/Three Phase PV Inverter',
  storage: 'images/inverters/Energy Storage Inverter',
  utility: 'images/inverters/Utility Scale PV Inverter',
};

window.INVERTER_MODELS = [
  { cat: 'single', name: "Solis-1P(3.6-5)K-4G-US", kw: "3.6-5 kW", image: "Solis-1P(3.6-5)K-4G-US.png" },
  { cat: 'single', name: "Solis-1P(6-10)K-4G-US", kw: "6-10 kW", image: "Solis-1P(6-10)K-4G-US.png" },
  { cat: 'three', name: "S5-GC(75-125)K-US", kw: "75-125 kW", image: "S5-GC(75-125)K-US.png" },
  { cat: 'three', name: "S6-GC(25-60)K-US", kw: "25-60 kW", image: "S6-GC(25-60)K-US.png" },
  { cat: 'three', name: "S6-GC30K-LV-US . S5-GC60K-LV-US", kw: "30 kW and 60 kW", image: "S6-GC30K-LV-US . S5-GC60K-LV-US.png" },
  { cat: 'storage', name: "S6-EH1P(3.8-11.4)K-H-US", kw: "3.8-11.4 kW", image: "S6-EH1P(3.8-11.4)K-H-US.png" },
  { cat: 'storage', name: "S6-EH2P(9.6-16)K03-SV-YD-L-US", kw: "9.6-16 kW", image: "S6-EH2P(9.6-16)K03-SV-YD-L-US.png" },
  { cat: 'storage', name: "S6-EH3P(30-60)K-NV-YD-H-US", kw: "30-60 kW", image: "S6-EH3P(30-60)K-NV-YD-H-US.png" },
  { cat: 'storage', name: "S6-EH3P(30-60)K-YD-H-US(21A)", kw: "30-60 kW", image: "S6-EH3P(30-60)K-YD-H-US(21A).png" },
  { cat: 'storage', name: "S6-EH3P(75-150)K10-YD-H-US", kw: "75-150 kW", image: "S6-EH3P(75-150)K10-YD-H-US.png" },
  { cat: 'utility', name: "S6-GU250K-EHV-US-M12", kw: "250 kW", image: "S6-GU250K-EHV-US-M12.png" },
  { cat: 'utility', name: "Solis-(125-185)K-EHV-5G-US-PLUS", kw: "125-185 kW", image: "Solis-(125-185)K-EHV-5G-US-PLUS.png" },
  { cat: 'utility', name: "Solis-4200-MV Skid Solution", kw: "Medium-voltage skid solution", image: "Solis-4200-MV Skid Solution.png" },
];
