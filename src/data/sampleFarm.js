export const sampleFarm = {
  name: "Ravi's Farm — Pune District, Maharashtra",
  budget: 80000,
  weeklyWater: 15000,
  season: {
    totalWeeks: 24,
    phases: [
      { id: 1, name: "Kharif Early", startWeek: 1,  endWeek: 8  },
      { id: 2, name: "Kharif Late",  startWeek: 9,  endWeek: 16 },
      { id: 3, name: "Rabi",         startWeek: 17, endWeek: 24 },
    ],
  },
  plots: [
    { id:"P1", name:"Plot 1 (North)", area:2.5, soilType:"loamy",  fertility:85, irrigationNode:"N1", currentCrop:null, soilHistory:[], adjacent:["P2","P3"] },
    { id:"P2", name:"Plot 2 (East)",  area:1.8, soilType:"sandy",  fertility:70, irrigationNode:"N2", currentCrop:null, soilHistory:[], adjacent:["P1","P4"] },
    { id:"P3", name:"Plot 3 (South)", area:3.0, soilType:"clayey", fertility:90, irrigationNode:"N3", currentCrop:null, soilHistory:[], adjacent:["P1","P4","P5"] },
    { id:"P4", name:"Plot 4 (West)",  area:2.0, soilType:"loamy",  fertility:78, irrigationNode:"N4", currentCrop:null, soilHistory:[], adjacent:["P2","P3","P6"] },
    { id:"P5", name:"Plot 5 (Inner)", area:1.5, soilType:"silty",  fertility:82, irrigationNode:"N5", currentCrop:null, soilHistory:[], adjacent:["P3","P6"] },
    { id:"P6", name:"Plot 6 (Far)",   area:2.2, soilType:"sandy",  fertility:65, irrigationNode:"N6", currentCrop:null, soilHistory:[], adjacent:["P4","P5"] },
  ],
  crops: [
    { id:"C1",  name:"Wheat",     family:"Poaceae",       packageCost:8000,  expectedYield:45000, waterPerWeek:800,  plantingWindow:{startWeek:1, endWeek:6},  growthDurationWeeks:14, soilRecoveryWeeks:4, compatibleSoilTypes:["loamy","silty"],          soilFertilityDrain:12, incompatibleAfter:["C6"]  },
    { id:"C2",  name:"Tomato",    family:"Solanaceae",    packageCost:6000,  expectedYield:38000, waterPerWeek:600,  plantingWindow:{startWeek:1, endWeek:8},  growthDurationWeeks:12, soilRecoveryWeeks:3, compatibleSoilTypes:["loamy","clayey","silty"],  soilFertilityDrain:10, incompatibleAfter:["C3"]  },
    { id:"C3",  name:"Onion",     family:"Amaryllidaceae",packageCost:5000,  expectedYield:32000, waterPerWeek:500,  plantingWindow:{startWeek:3, endWeek:10}, growthDurationWeeks:10, soilRecoveryWeeks:2, compatibleSoilTypes:["loamy","sandy","silty"],   soilFertilityDrain:8,  incompatibleAfter:[]      },
    { id:"C4",  name:"Cotton",    family:"Malvaceae",     packageCost:12000, expectedYield:62000, waterPerWeek:1200, plantingWindow:{startWeek:1, endWeek:4},  growthDurationWeeks:20, soilRecoveryWeeks:6, compatibleSoilTypes:["clayey","loamy"],          soilFertilityDrain:18, incompatibleAfter:[]      },
    { id:"C5",  name:"Sugarcane", family:"Poaceae",       packageCost:10000, expectedYield:55000, waterPerWeek:1500, plantingWindow:{startWeek:1, endWeek:5},  growthDurationWeeks:22, soilRecoveryWeeks:8, compatibleSoilTypes:["loamy","clayey"],          soilFertilityDrain:15, incompatibleAfter:[]      },
    { id:"C6",  name:"Maize",     family:"Poaceae",       packageCost:4000,  expectedYield:28000, waterPerWeek:700,  plantingWindow:{startWeek:2, endWeek:8},  growthDurationWeeks:10, soilRecoveryWeeks:2, compatibleSoilTypes:["loamy","sandy","silty","clayey"], soilFertilityDrain:9, incompatibleAfter:["C1"] },
    { id:"C7",  name:"Soybean",   family:"Fabaceae",      packageCost:5500,  expectedYield:30000, waterPerWeek:550,  plantingWindow:{startWeek:1, endWeek:7},  growthDurationWeeks:12, soilRecoveryWeeks:1, compatibleSoilTypes:["loamy","silty"],          soilFertilityDrain:-5, incompatibleAfter:[]      },
    { id:"C8",  name:"Barley",    family:"Poaceae",       packageCost:6500,  expectedYield:35000, waterPerWeek:600,  plantingWindow:{startWeek:17,endWeek:22}, growthDurationWeeks:12, soilRecoveryWeeks:3, compatibleSoilTypes:["loamy","sandy"],          soilFertilityDrain:10, incompatibleAfter:[]      },
    { id:"C9",  name:"Chickpea",  family:"Fabaceae",      packageCost:4500,  expectedYield:25000, waterPerWeek:400,  plantingWindow:{startWeek:17,endWeek:22}, growthDurationWeeks:10, soilRecoveryWeeks:1, compatibleSoilTypes:["loamy","sandy","silty"],  soilFertilityDrain:-3, incompatibleAfter:[]      },
    { id:"C10", name:"Sunflower", family:"Asteraceae",    packageCost:7000,  expectedYield:40000, waterPerWeek:700,  plantingWindow:{startWeek:1, endWeek:6},  growthDurationWeeks:14, soilRecoveryWeeks:3, compatibleSoilTypes:["loamy","clayey","sandy"],  soilFertilityDrain:11, incompatibleAfter:[]      },
  ],
  irrigationNetwork: {
    nodes: [
      { id:"SOURCE", label:"Borewell",   type:"source",   x:300, y:40  },
      { id:"J1",     label:"Junction 1", type:"junction", x:140, y:140 },
      { id:"J2",     label:"Junction 2", type:"junction", x:300, y:160 },
      { id:"J3",     label:"Junction 3", type:"junction", x:460, y:140 },
      { id:"N1",     label:"Plot 1",     type:"plot",     x:60,  y:260 },
      { id:"N2",     label:"Plot 2",     type:"plot",     x:200, y:280 },
      { id:"N3",     label:"Plot 3",     type:"plot",     x:280, y:290 },
      { id:"N4",     label:"Plot 4",     type:"plot",     x:360, y:280 },
      { id:"N5",     label:"Plot 5",     type:"plot",     x:460, y:270 },
      { id:"N6",     label:"Plot 6",     type:"plot",     x:550, y:285 },
    ],
    edges: [
      { from:"SOURCE", to:"J1", capacity:8000,  efficiencyLoss:0.05, degradationRate:0.002 },
      { from:"SOURCE", to:"J2", capacity:10000, efficiencyLoss:0.03, degradationRate:0.001 },
      { from:"SOURCE", to:"J3", capacity:8000,  efficiencyLoss:0.06, degradationRate:0.002 },
      { from:"J1",     to:"N1", capacity:4000,  efficiencyLoss:0.04, degradationRate:0.003 },
      { from:"J1",     to:"N2", capacity:4000,  efficiencyLoss:0.03, degradationRate:0.002 },
      { from:"J2",     to:"N3", capacity:5000,  efficiencyLoss:0.02, degradationRate:0.001 },
      { from:"J2",     to:"N4", capacity:5000,  efficiencyLoss:0.04, degradationRate:0.002 },
      { from:"J3",     to:"N5", capacity:4000,  efficiencyLoss:0.03, degradationRate:0.002 },
      { from:"J3",     to:"N6", capacity:4000,  efficiencyLoss:0.07, degradationRate:0.004 },
    ],
  },
  // Farm coordinates for TSP (farmhouse + plots)
  plotCoordinates: [
    { id:"FARM", label:"Farmhouse", x:300, y:300 },
    { id:"P1",   label:"Plot 1",    x:100, y:150 },
    { id:"P2",   label:"Plot 2",    x:450, y:120 },
    { id:"P3",   label:"Plot 3",    x:80,  y:400 },
    { id:"P4",   label:"Plot 4",    x:500, y:380 },
    { id:"P5",   label:"Plot 5",    x:300, y:150 },
    { id:"P6",   label:"Plot 6",    x:280, y:480 },
  ],
};

export const CROP_COLORS = {
  C1:  '#FDD835', // wheat - yellow
  C2:  '#E53935', // tomato - red
  C3:  '#8E24AA', // onion - purple
  C4:  '#795548', // cotton - brown
  C5:  '#43A047', // sugarcane - green
  C6:  '#FFB300', // maize - amber
  C7:  '#7CB342', // soybean - light green
  C8:  '#F9A825', // barley - dark yellow
  C9:  '#FF7043', // chickpea - deep orange
  C10: '#FFCA28', // sunflower - yellow
  null:'#CFD8DC', // fallow - grey
};

export const MODULE_COLORS = {
  2: { bg:'#E3F2FD', border:'#1565C0', text:'#1565C0', label:'Module 2 — Divide & Conquer' },
  3: { bg:'#F3E5F5', border:'#6A1B9A', text:'#6A1B9A', label:'Module 3 — Greedy' },
  4: { bg:'#E8F5E9', border:'#2E7D32', text:'#2E7D32', label:'Module 4 — Dynamic Programming' },
  5: { bg:'#FFF3E0', border:'#E65100', text:'#E65100', label:'Module 5 — Backtracking' },
  6: { bg:'#FCE4EC', border:'#880E4F', text:'#880E4F', label:'Module 6 — Branch & Bound' },
};
