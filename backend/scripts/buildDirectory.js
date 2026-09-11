const fs = require('fs');
const path = require('path');

const REGIONAL_DISTRIBUTION = [
  {
    region: 'Vidarbha',
    villages: [
      { village: 'Chandur Railway', taluka: 'Chandur Railway', district: 'Amravati' },
      { village: 'Morshi', taluka: 'Morshi', district: 'Amravati' },
      { village: 'Warud', taluka: 'Warud', district: 'Amravati' },
      { village: 'Achalpur', taluka: 'Achalpur', district: 'Amravati' },
      { village: 'Murtizapur', taluka: 'Murtizapur', district: 'Akola' },
      { village: 'Telhara', taluka: 'Telhara', district: 'Akola' },
      { village: 'Seloo', taluka: 'Seloo', district: 'Wardha' },
      { village: 'Arvi', taluka: 'Arvi', district: 'Wardha' },
      { village: 'Hingna', taluka: 'Hingna', district: 'Nagpur' },
      { village: 'Katol', taluka: 'Katol', district: 'Nagpur' },
      { village: 'Kalmeshwar', taluka: 'Kalmeshwar', district: 'Nagpur' },
      { village: 'Pusad', taluka: 'Pusad', district: 'Yavatmal' },
      { village: 'Darwha', taluka: 'Darwha', district: 'Yavatmal' },
      { village: 'Khamgaon', taluka: 'Khamgaon', district: 'Buldhana' },
      { village: 'Malkapur', taluka: 'Malkapur', district: 'Buldhana' },
    ],
    soilTypes: ['Regur Deep Black Cotton Soil', 'Medium Black Soil', 'Clay Loam Soil'],
    cropPairs: [
      { primary: 'Cotton', secondary: 'Soybean' },
      { primary: 'Soybean', secondary: 'Chickpea' },
      { primary: 'Cotton', secondary: 'Chickpea' },
      { primary: 'Orange', secondary: 'Cotton' },
      { primary: 'Soybean', secondary: 'Cotton' },
    ],
    fpo: 'Vidarbha Cotton & Soybean Farmers Producer Co.',
  },
  {
    region: 'Khandesh & North Maharashtra',
    villages: [
      { village: 'Dindori', taluka: 'Dindori', district: 'Nashik' },
      { village: 'Niphad', taluka: 'Niphad', district: 'Nashik' },
      { village: 'Yeola', taluka: 'Yeola', district: 'Nashik' },
      { village: 'Sinnar', taluka: 'Sinnar', district: 'Nashik' },
      { village: 'Kalwan', taluka: 'Kalwan', district: 'Nashik' },
      { village: 'Satana', taluka: 'Baglan', district: 'Nashik' },
      { village: 'Raver', taluka: 'Raver', district: 'Jalgaon' },
      { village: 'Chopda', taluka: 'Chopda', district: 'Jalgaon' },
      { village: 'Yawal', taluka: 'Yawal', district: 'Jalgaon' },
      { village: 'Shirpur', taluka: 'Shirpur', district: 'Dhule' },
      { village: 'Sakri', taluka: 'Sakri', district: 'Dhule' },
      { village: 'Shahada', taluka: 'Shahada', district: 'Nandurbar' },
    ],
    soilTypes: ['Fertile Alluvial Loam', 'Red Sandy Loam', 'Well-Drained Black Loam'],
    cropPairs: [
      { primary: 'Onion', secondary: 'Tomato' },
      { primary: 'Tomato', secondary: 'Onion' },
      { primary: 'Grapes', secondary: 'Tomato' },
      { primary: 'Banana', secondary: 'Maize' },
      { primary: 'Onion', secondary: 'Wheat' },
    ],
    fpo: 'Sahyadri Valley Farmer Producer Co.',
  },
  {
    region: 'Western Maharashtra',
    villages: [
      { village: 'Khed', taluka: 'Khed', district: 'Pune' },
      { village: 'Junnar', taluka: 'Junnar', district: 'Pune' },
      { village: 'Baramati', taluka: 'Baramati', district: 'Pune' },
      { village: 'Shirur', taluka: 'Shirur', district: 'Pune' },
      { village: 'Rahuri', taluka: 'Rahuri', district: 'Ahmednagar' },
      { village: 'Sangamner', taluka: 'Sangamner', district: 'Ahmednagar' },
      { village: 'Karad', taluka: 'Karad', district: 'Satara' },
      { village: 'Wai', taluka: 'Wai', district: 'Satara' },
      { village: 'Shirol', taluka: 'Shirol', district: 'Kolhapur' },
      { village: 'Hatkanangle', taluka: 'Hatkanangle', district: 'Kolhapur' },
      { village: 'Walwa', taluka: 'Walwa', district: 'Sangli' },
      { village: 'Pandharpur', taluka: 'Pandharpur', district: 'Solapur' },
    ],
    soilTypes: ['Deep Clay Loam', 'Rich Canal Alluvium', 'Medium Black Soil'],
    cropPairs: [
      { primary: 'Sugarcane', secondary: 'Wheat' },
      { primary: 'Onion', secondary: 'Wheat' },
      { primary: 'Tomato', secondary: 'Soybean' },
      { primary: 'Wheat', secondary: 'Chickpea' },
      { primary: 'Sugarcane', secondary: 'Onion' },
    ],
    fpo: 'Godavari Agro Producer Company',
  },
  {
    region: 'Marathwada',
    villages: [
      { village: 'Paithan', taluka: 'Paithan', district: 'Chhatrapati Sambhajinagar' },
      { village: 'Gangapur', taluka: 'Gangapur', district: 'Chhatrapati Sambhajinagar' },
      { village: 'Ambad', taluka: 'Ambad', district: 'Jalna' },
      { village: 'Partur', taluka: 'Partur', district: 'Jalna' },
      { village: 'Ausa', taluka: 'Ausa', district: 'Latur' },
      { village: 'Renapur', taluka: 'Renapur', district: 'Latur' },
      { village: 'Georai', taluka: 'Georai', district: 'Beed' },
      { village: 'Loha', taluka: 'Loha', district: 'Nanded' },
    ],
    soilTypes: ['Heavy Black Cotton Soil', 'Medium Depth Clay Loam', 'Basaltic Regur'],
    cropPairs: [
      { primary: 'Soybean', secondary: 'Cotton' },
      { primary: 'Cotton', secondary: 'Chickpea' },
      { primary: 'Soybean', secondary: 'Wheat' },
      { primary: 'Cotton', secondary: 'Soybean' },
    ],
    fpo: 'Marathwada Krushi Vikas Producer Co.',
  },
];

const FIRST_NAMES = [
  'Pranav', 'Ramesh', 'Suresh', 'Mahesh', 'Ganesh', 'Dinesh', 'Santosh', 'Sachin', 'Nitin', 'Sunil',
  'Anil', 'Rajesh', 'Vikas', 'Pravin', 'Deepak', 'Vijay', 'Sanjay', 'Ashok', 'Kishor', 'Dilip',
  'Pandurang', 'Tukaram', 'Dnyaneshwar', 'Vitthal', 'Eknath', 'Namdev', 'Baburao', 'Maruti', 'Shankar', 'Vishnu',
  'Sunita', 'Priya', 'Kavita', 'Asha', 'Sangita', 'Rekha', 'Vandana', 'Shobha', 'Usha', 'Suman',
  'Balasaheb', 'Bhausaheb', 'Anandrao', 'Raosaheb', 'Dattatray', 'Chandrakant', 'Kashinath', 'Shivaji', 'Sambhajirao', 'Tanaji'
];

const LAST_NAMES = [
  'Deshmukh', 'Patil', 'Jadhav', 'Pawar', 'Shinde', 'Bhosale', 'Kulkarni', 'Wagh', 'Chavan', 'Gaikwad',
  'More', 'Kale', 'Sawant', 'Mane', 'Thorat', 'Jagtap', 'Gite', 'Bande', 'Shelke', 'Ghadge',
  'Kakade', 'Dhumal', 'Gholap', 'Solanke', 'Munde', 'Gawande', 'Kadu', 'Bobade', 'Rathod', 'Chaudhari'
];

function buildMaharashtraFarmers() {
  const farmers = [];
  farmers.push({
    id: 'fam1',
    username: 'fam1',
    name: 'Pranav',
    village: 'Chandur Railway',
    taluka: 'Chandur Railway',
    district: 'Amravati',
    region: 'Vidarbha',
    phone: '+91 98221 54321',
    landAcres: 5.0,
    soilType: 'Regur Black Cotton Soil',
    primaryCrop: 'Cotton',
    secondaryCrop: 'Soybean',
    fpoAffiliation: 'Vidarbha Cotton & Soybean Farmers Producer Co.',
    trustScore: 96,
    status: 'Verified Active',
    email: 'fam1@farm2market.ai',
  });

  for (let i = 2; i <= 120; i++) {
    const id = 'fam' + i;
    const username = 'fam' + i;
    const email = 'fam' + i + '@farm2market.ai';

    let regGroup = REGIONAL_DISTRIBUTION[0];
    if (i > 35 && i <= 70) regGroup = REGIONAL_DISTRIBUTION[1];
    else if (i > 70 && i <= 100) regGroup = REGIONAL_DISTRIBUTION[2];
    else if (i > 100) regGroup = REGIONAL_DISTRIBUTION[3];

    const loc = regGroup.villages[(i - 1) % regGroup.villages.length];
    const cropPair = regGroup.cropPairs[(i - 1) % regGroup.cropPairs.length];
    const soil = regGroup.soilTypes[(i - 1) % regGroup.soilTypes.length];
    const firstName = FIRST_NAMES[(i * 3 + 7) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 5 + 11) % LAST_NAMES.length];

    const landAcres = Math.round((2.5 + ((i * 7) % 75) / 10) * 10) / 10;
    const trustScore = 85 + ((i * 13) % 15);
    const phone = '+91 98' + ((10000000 + i * 78923) % 90000000);

    farmers.push({
      id,
      username,
      name: firstName + ' ' + lastName,
      village: loc.village,
      taluka: loc.taluka,
      district: loc.district,
      region: regGroup.region,
      phone,
      landAcres,
      soilType: soil,
      primaryCrop: cropPair.primary,
      secondaryCrop: cropPair.secondary,
      fpoAffiliation: regGroup.fpo,
      trustScore,
      status: 'Verified Active',
      email,
    });
  }
  return farmers;
}

const farmers = buildMaharashtraFarmers();

const code = `export interface FarmerRecord {
  id: string;
  username: string;
  name: string;
  village: string;
  taluka: string;
  district: string;
  region: string;
  phone: string;
  landAcres: number;
  soilType: string;
  primaryCrop: string;
  secondaryCrop: string;
  fpoAffiliation: string;
  trustScore: number;
  status: string;
  email: string;
}

export interface BuyerRecord {
  id: string;
  username: string;
  contactPerson: string;
  businessName: string;
  buyerType: string;
  location: string;
  district: string;
  phone: string;
  email: string;
  requirementCrop: string;
  volumeKgPerMonth: number;
  budgetPerKg: number;
  rating: number;
  gstin: string;
  verificationStatus: string;
}

export interface FPORecord {
  id: string;
  username: string;
  name: string;
  registrationNo: string;
  district: string;
  location: string;
  memberFarmers: number;
  primaryCrops: string;
  contactPerson: string;
  phone: string;
  email: string;
  grade: string;
}

export interface AdminRecord {
  id: string;
  username: string;
  name: string;
  roleTitle: string;
  department: string;
  regionScope: string;
  email: string;
  phone: string;
}

export const MAHARASHTRA_FARMERS: FarmerRecord[] = ` + JSON.stringify(farmers, null, 2) + `;

export const MAHARASHTRA_BUYERS: BuyerRecord[] = [
  {
    id: 'byer1',
    username: 'byer1',
    contactPerson: 'Rohit Agarwal',
    businessName: 'Maharashtra Agro Traders',
    buyerType: 'GINNER_WHOLESALER',
    location: 'Amravati & Nagpur Industrial Area',
    district: 'Amravati',
    phone: '+91 98220 11223',
    email: 'byer1@farm2market.ai',
    requirementCrop: 'Cotton',
    volumeKgPerMonth: 80000,
    budgetPerKg: 88.0,
    rating: 4.8,
    gstin: '27AABCM1234A1Z5',
    verificationStatus: 'Verified Enterprise',
  },
  {
    id: 'byer2',
    username: 'byer2',
    contactPerson: 'Farhan Sheikh',
    businessName: 'Vidarbha Textile & Ginning Mills',
    buyerType: 'PROCESSOR',
    location: 'MIDC Hingna, Nagpur',
    district: 'Nagpur',
    phone: '+91 98224 44556',
    email: 'byer2@farm2market.ai',
    requirementCrop: 'Cotton',
    volumeKgPerMonth: 120000,
    budgetPerKg: 87.5,
    rating: 4.9,
    gstin: '27AABCV5678B1Z2',
    verificationStatus: 'Verified Enterprise',
  },
  {
    id: 'byer3',
    username: 'byer3',
    contactPerson: 'Amit Kulkarni',
    businessName: 'FreshCart Retail Logistics',
    buyerType: 'RETAILER',
    location: 'Gultekdi Market Yard, Pune',
    district: 'Pune',
    phone: '+91 98230 77889',
    email: 'byer3@farm2market.ai',
    requirementCrop: 'Tomato',
    volumeKgPerMonth: 50000,
    budgetPerKg: 29.0,
    rating: 4.7,
    gstin: '27AABCF9012C1Z8',
    verificationStatus: 'Verified Enterprise',
  },
  {
    id: 'byer4',
    username: 'byer4',
    contactPerson: 'Pooja Shah',
    businessName: 'Sahyadri Food Processing Exports',
    buyerType: 'EXPORTER',
    location: 'Pimpalgaon Baswant, Nashik',
    district: 'Nashik',
    phone: '+91 98902 33445',
    email: 'byer4@farm2market.ai',
    requirementCrop: 'Onion',
    volumeKgPerMonth: 90000,
    budgetPerKg: 32.0,
    rating: 4.9,
    gstin: '27AABCS3456D1Z1',
    verificationStatus: 'Verified Enterprise',
  },
  {
    id: 'byer5',
    username: 'byer5',
    contactPerson: 'Karan Malhotra',
    businessName: 'Bombay Supermarket Direct',
    buyerType: 'SUPERMARKET_CHAIN',
    location: 'APMC Complex, Vashi, Navi Mumbai',
    district: 'Mumbai',
    phone: '+91 98201 55667',
    email: 'byer5@farm2market.ai',
    requirementCrop: 'Wheat',
    volumeKgPerMonth: 100000,
    budgetPerKg: 32.5,
    rating: 4.6,
    gstin: '27AABCB7890E1Z4',
    verificationStatus: 'Verified Enterprise',
  },
  {
    id: 'byer6',
    username: 'byer6',
    contactPerson: 'Vikram Singh',
    businessName: 'Apex Oilseeds & Solvent Extraction',
    buyerType: 'PROCESSOR',
    location: 'MIDC Phase II, Akola',
    district: 'Akola',
    phone: '+91 98503 66778',
    email: 'byer6@farm2market.ai',
    requirementCrop: 'Soybean',
    volumeKgPerMonth: 150000,
    budgetPerKg: 49.5,
    rating: 4.8,
    gstin: '27AABCA2345F1Z7',
    verificationStatus: 'Verified Enterprise',
  },
  {
    id: 'byer7',
    username: 'byer7',
    contactPerson: 'Snehal Joshi',
    businessName: 'Deccan Fruits & Citrus Packers',
    buyerType: 'WHOLESALER',
    location: 'Kalamna Market, Nagpur',
    district: 'Nagpur',
    phone: '+91 98711 22334',
    email: 'byer7@farm2market.ai',
    requirementCrop: 'Orange',
    volumeKgPerMonth: 45000,
    budgetPerKg: 48.0,
    rating: 4.7,
    gstin: '27AABCD6789G1Z0',
    verificationStatus: 'Verified Enterprise',
  },
  {
    id: 'byer8',
    username: 'byer8',
    contactPerson: 'Meenal Rao',
    businessName: 'Kisan Mandi Wholesale Mart',
    buyerType: 'WHOLESALER',
    location: 'Shiroli MIDC, Kolhapur',
    district: 'Kolhapur',
    phone: '+91 98450 88990',
    email: 'byer8@farm2market.ai',
    requirementCrop: 'Sugarcane',
    volumeKgPerMonth: 200000,
    budgetPerKg: 3.4,
    rating: 4.5,
    gstin: '27AABCK0123H1Z3',
    verificationStatus: 'Verified Enterprise',
  },
  {
    id: 'byer9',
    username: 'byer9',
    contactPerson: 'Arjun Nair',
    businessName: 'PureHarvest Organics',
    buyerType: 'ORGANIC_PROCESSOR',
    location: 'Bandra Kurla Complex, Mumbai',
    district: 'Mumbai',
    phone: '+91 98190 99001',
    email: 'byer9@farm2market.ai',
    requirementCrop: 'Cotton',
    volumeKgPerMonth: 35000,
    budgetPerKg: 94.0,
    rating: 4.9,
    gstin: '27AABCP4567I1Z6',
    verificationStatus: 'Verified Enterprise',
  },
  {
    id: 'byer10',
    username: 'byer10',
    contactPerson: 'Neha Mehta',
    businessName: 'Khandesh Agro Food Hub',
    buyerType: 'EXPORTER',
    location: 'MIDC Jalgaon',
    district: 'Jalgaon',
    phone: '+91 98233 44556',
    email: 'byer10@farm2market.ai',
    requirementCrop: 'Banana',
    volumeKgPerMonth: 75000,
    budgetPerKg: 22.5,
    rating: 4.8,
    gstin: '27AABCK8901J1Z9',
    verificationStatus: 'Verified Enterprise',
  },
];

export const MAHARASHTRA_FPOS: FPORecord[] = [
  {
    id: 'fpo1',
    username: 'fpo1',
    name: 'Vidarbha Cotton & Soybean Farmers Producer Co.',
    registrationNo: 'U01409MH2021PTC361284',
    district: 'Amravati',
    location: 'Chandur Railway, Amravati',
    memberFarmers: 850,
    primaryCrops: 'Cotton, Soybean, Chickpea',
    contactPerson: 'Sanjay Deshmukh (Managing Director)',
    phone: '+91 98221 33445',
    email: 'fpo1@farm2market.ai',
    grade: 'A+',
  },
  {
    id: 'fpo2',
    username: 'fpo2',
    name: 'Sahyadri Valley Farmer Producer Co.',
    registrationNo: 'U01111MH2020PTC345678',
    district: 'Nashik',
    location: 'Mohadi, Dindori, Nashik',
    memberFarmers: 1200,
    primaryCrops: 'Onion, Tomato, Grapes',
    contactPerson: 'Vilas Shinde (Chairman)',
    phone: '+91 98231 44556',
    email: 'fpo2@farm2market.ai',
    grade: 'A+',
  },
  {
    id: 'fpo3',
    username: 'fpo3',
    name: 'Godavari Agro Producer Company',
    registrationNo: 'U01403MH2019PTC321456',
    district: 'Ahmednagar',
    location: 'Rahuri, Ahmednagar',
    memberFarmers: 620,
    primaryCrops: 'Sugarcane, Onion, Wheat',
    contactPerson: 'Balasaheb Vikhe (Director)',
    phone: '+91 98225 55667',
    email: 'fpo3@farm2market.ai',
    grade: 'A',
  },
  {
    id: 'fpo4',
    username: 'fpo4',
    name: 'Mahagrapes & Onion Growers Producer Co.',
    registrationNo: 'U01122MH2021PTC378901',
    district: 'Nashik',
    location: 'Pimpalgaon, Niphad, Nashik',
    memberFarmers: 940,
    primaryCrops: 'Grapes, Onion',
    contactPerson: 'Govindrao Pawar (Secretary)',
    phone: '+91 98901 66778',
    email: 'fpo4@farm2market.ai',
    grade: 'A+',
  },
  {
    id: 'fpo5',
    username: 'fpo5',
    name: 'Khandesh Banana & Maize Farmers Co.',
    registrationNo: 'U01400MH2022PTC389012',
    district: 'Jalgaon',
    location: 'Raver, Jalgaon',
    memberFarmers: 780,
    primaryCrops: 'Banana, Maize',
    contactPerson: 'Dinesh Patil (CEO)',
    phone: '+91 98232 77889',
    email: 'fpo5@farm2market.ai',
    grade: 'A',
  },
  {
    id: 'fpo6',
    username: 'fpo6',
    name: 'Marathwada Krushi Vikas Producer Co.',
    registrationNo: 'U01401MH2020PTC356789',
    district: 'Latur',
    location: 'MIDC Ausa Road, Latur',
    memberFarmers: 650,
    primaryCrops: 'Soybean, Pulses, Cotton',
    contactPerson: 'Sambhaji Munde (Chairman)',
    phone: '+91 98504 88990',
    email: 'fpo6@farm2market.ai',
    grade: 'A',
  },
];

export const MAHARASHTRA_ADMINS: AdminRecord[] = [
  {
    id: 'admin1',
    username: 'admin1',
    name: 'Anjali Deshmukh',
    roleTitle: 'State Nodal Officer & Joint Secretary',
    department: 'Department of Consumer Affairs (DoCA), Maharashtra HQ',
    regionScope: 'Maharashtra State-wide Oversight',
    email: 'admin1@farm2market.ai',
    phone: '+91 22 2202 4567',
  },
  {
    id: 'admin2',
    username: 'admin2',
    name: 'Rajesh Kulkarni',
    roleTitle: 'Director, Price Monitoring & Anti-Hoarding Cell',
    department: 'DoCA Price Monitoring & APMC Regulatory Authority',
    regionScope: 'Western Maharashtra & Pune Division',
    email: 'admin2@farm2market.ai',
    phone: '+91 20 2612 8901',
  },
  {
    id: 'admin3',
    username: 'admin3',
    name: 'Sunita Verma',
    roleTitle: 'Zonal Agricultural Price & Supply Oversight Officer',
    department: 'DoCA Vidarbha Regional Directorate',
    regionScope: 'Vidarbha Division (Nagpur, Amravati, Akola, Wardha)',
    email: 'admin3@farm2market.ai',
    phone: '+91 712 256 7890',
  },
  {
    id: 'admin4',
    username: 'admin4',
    name: 'Manoj Shinde',
    roleTitle: 'Agmarknet Compliance & Quality Verification Director',
    department: 'DoCA Quality & Consumer Protection Division',
    regionScope: 'North Maharashtra & Marathwada Division',
    email: 'admin4@farm2market.ai',
    phone: '+91 253 257 1234',
  },
];
`;

const targetPath = path.join(__dirname, '..', 'src', 'data', 'maharashtraDirectory.ts');
fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully generated ' + targetPath);
