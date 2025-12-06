// backend/prisma/seed.js - COMPLETE ENHANCED SEED WITH REAL DATA
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// =================== UNIVERSAL PASSWORD ===================
const UNIVERSAL_PASSWORD = "Test@123";

// =================== FIREBASE DEVICE IDS ===================
const FIREBASE_DEVICE_IDS = [
  "User1", "User2", "User3", "User4", "User5",
  "User6", "User7", "User8", "User9"
];

// =================== INSTITUTES DATA ===================
const INSTITUTES_DATA = [
  { instituteId: "ITI_JAIPUR", name: "Government ITI Jaipur" },
  { instituteId: "ITI_KHO_NAGORIYAN", name: "Government ITI Kho Nagoriyan" },
  { instituteId: "GURUKUL_ITI", name: "Gurukul ITI Jaipur" },
  { instituteId: "BHAWANI_NIKETAN", name: "Shri Bhawani Niketan ITI" },
  { instituteId: "BSDU", name: "Bhartiya Skill Development University" }
];

// =================== DEPARTMENTS ===================
const DEPARTMENTS = [
  "FITTER_MANUFACTURING",
  "ELECTRICAL_ENGINEERING",
  "WELDING_FABRICATION",
  "TOOL_DIE_MAKING",
  "ADDITIVE_MANUFACTURING",
  "SOLAR_INSTALLER_PV",
  "MATERIAL_TESTING_QUALITY",
  "ADVANCED_MANUFACTURING_CNC",
  "AUTOMOTIVE_MECHANIC"
];

// =================== USERS DATA ===================
const POLICY_MAKERS = [
  { email: "rajesh.kumar@education.gov.in", firstName: "Rajesh", lastName: "Kumar" },
  { email: "priya.sharma@education.gov.in", firstName: "Priya", lastName: "Sharma" }
];

// 2 Lab Managers per institute = 10 total
const LAB_MANAGERS = [
  { email: "amit.verma@itijaipur.edu.in", firstName: "Amit", lastName: "Verma", instituteIndex: 0 },
  { email: "sunita.patel@itijaipur.edu.in", firstName: "Sunita", lastName: "Patel", instituteIndex: 0 },
  { email: "vijay.singh@itikho.edu.in", firstName: "Vijay", lastName: "Singh", instituteIndex: 1 },
  { email: "meera.desai@itikho.edu.in", firstName: "Meera", lastName: "Desai", instituteIndex: 1 },
  { email: "kavita.mehta@gurukul.edu.in", firstName: "Kavita", lastName: "Mehta", instituteIndex: 2 },
  { email: "rohit.malhotra@gurukul.edu.in", firstName: "Rohit", lastName: "Malhotra", instituteIndex: 2 },
  { email: "anjali.reddy@bhawani.edu.in", firstName: "Anjali", lastName: "Reddy", instituteIndex: 3 },
  { email: "prakash.joshi@bhawani.edu.in", firstName: "Prakash", lastName: "Joshi", instituteIndex: 3 },
  { email: "deepika.nair@bsdu.edu.in", firstName: "Deepika", lastName: "Nair", instituteIndex: 4 },
  { email: "rakesh.pandey@bsdu.edu.in", firstName: "Rakesh", lastName: "Pandey", instituteIndex: 4 }
];

// 3-4 Trainers per lab (5 institutes × 2 labs/dept × 9 depts = 90 labs, need ~270-360 trainers)
// Creating 100 trainers for distribution
const TRAINERS = [
  { email: "ramesh.yadav@trainer.edu.in", firstName: "Ramesh", lastName: "Yadav" },
  { email: "neha.gupta@trainer.edu.in", firstName: "Neha", lastName: "Gupta" },
  { email: "suresh.reddy@trainer.edu.in", firstName: "Suresh", lastName: "Reddy" },
  { email: "anita.desai@trainer.edu.in", firstName: "Anita", lastName: "Desai" },
  { email: "manoj.joshi@trainer.edu.in", firstName: "Manoj", lastName: "Joshi" },
  { email: "deepa.nair@trainer.edu.in", firstName: "Deepa", lastName: "Nair" },
  { email: "pooja.saxena@trainer.edu.in", firstName: "Pooja", lastName: "Saxena" },
  { email: "arun.menon@trainer.edu.in", firstName: "Arun", lastName: "Menon" },
  { email: "swati.jain@trainer.edu.in", firstName: "Swati", lastName: "Jain" },
  { email: "kiran.bose@trainer.edu.in", firstName: "Kiran", lastName: "Bose" },
  { email: "gaurav.kapoor@trainer.edu.in", firstName: "Gaurav", lastName: "Kapoor" },
  { email: "ritu.sharma@trainer.edu.in", firstName: "Ritu", lastName: "Sharma" },
  { email: "vikram.singh@trainer.edu.in", firstName: "Vikram", lastName: "Singh" },
  { email: "preeti.agarwal@trainer.edu.in", firstName: "Preeti", lastName: "Agarwal" },
  { email: "ajay.kumar@trainer.edu.in", firstName: "Ajay", lastName: "Kumar" },
  { email: "sonia.verma@trainer.edu.in", firstName: "Sonia", lastName: "Verma" },
  { email: "harish.patel@trainer.edu.in", firstName: "Harish", lastName: "Patel" },
  { email: "divya.malhotra@trainer.edu.in", firstName: "Divya", lastName: "Malhotra" },
  { email: "rajat.chauhan@trainer.edu.in", firstName: "Rajat", lastName: "Chauhan" },
  { email: "megha.bansal@trainer.edu.in", firstName: "Megha", lastName: "Bansal" },
  { email: "naveen.thakur@trainer.edu.in", firstName: "Naveen", lastName: "Thakur" },
  { email: "shruti.iyer@trainer.edu.in", firstName: "Shruti", lastName: "Iyer" },
  { email: "mohit.rana@trainer.edu.in", firstName: "Mohit", lastName: "Rana" },
  { email: "pallavi.khanna@trainer.edu.in", firstName: "Pallavi", lastName: "Khanna" },
  { email: "sanjay.dubey@trainer.edu.in", firstName: "Sanjay", lastName: "Dubey" },
  { email: "nisha.gupta@trainer.edu.in", firstName: "Nisha", lastName: "Gupta" },
  { email: "alok.mishra@trainer.edu.in", firstName: "Alok", lastName: "Mishra" },
  { email: "priyanka.chawla@trainer.edu.in", firstName: "Priyanka", lastName: "Chawla" },
  { email: "rahul.bajaj@trainer.edu.in", firstName: "Rahul", lastName: "Bajaj" },
  { email: "tanvi.sinha@trainer.edu.in", firstName: "Tanvi", lastName: "Sinha" },
  { email: "varun.mehta@trainer.edu.in", firstName: "Varun", lastName: "Mehta" },
  { email: "sneha.rajput@trainer.edu.in", firstName: "Sneha", lastName: "Rajput" },
  { email: "ashok.tiwari@trainer.edu.in", firstName: "Ashok", lastName: "Tiwari" },
  { email: "kavya.reddy@trainer.edu.in", firstName: "Kavya", lastName: "Reddy" },
  { email: "nikhil.jain@trainer.edu.in", firstName: "Nikhil", lastName: "Jain" },
  { email: "aarti.shah@trainer.edu.in", firstName: "Aarti", lastName: "Shah" },
  { email: "pankaj.goyal@trainer.edu.in", firstName: "Pankaj", lastName: "Goyal" },
  { email: "rashmi.kapoor@trainer.edu.in", firstName: "Rashmi", lastName: "Kapoor" },
  { email: "sumit.agnihotri@trainer.edu.in", firstName: "Sumit", lastName: "Agnihotri" },
  { email: "archana.pillai@trainer.edu.in", firstName: "Archana", lastName: "Pillai" },
  { email: "manish.bhatt@trainer.edu.in", firstName: "Manish", lastName: "Bhatt" },
  { email: "sapna.rastogi@trainer.edu.in", firstName: "Sapna", lastName: "Rastogi" },
  { email: "abhishek.soni@trainer.edu.in", firstName: "Abhishek", lastName: "Soni" },
  { email: "ruchi.arora@trainer.edu.in", firstName: "Ruchi", lastName: "Arora" },
  { email: "kunal.saxena@trainer.edu.in", firstName: "Kunal", lastName: "Saxena" },
  { email: "shweta.dixit@trainer.edu.in", firstName: "Shweta", lastName: "Dixit" },
  { email: "tarun.mallik@trainer.edu.in", firstName: "Tarun", lastName: "Mallik" },
  { email: "geeta.kulkarni@trainer.edu.in", firstName: "Geeta", lastName: "Kulkarni" },
  { email: "yash.srivastava@trainer.edu.in", firstName: "Yash", lastName: "Srivastava" },
  { email: "shilpa.mahajan@trainer.edu.in", firstName: "Shilpa", lastName: "Mahajan" },
  { email: "vivek.chauhan@trainer.edu.in", firstName: "Vivek", lastName: "Chauhan" },
  { email: "anuja.bhagat@trainer.edu.in", firstName: "Anuja", lastName: "Bhagat" },
  { email: "dhruv.pathak@trainer.edu.in", firstName: "Dhruv", lastName: "Pathak" },
  { email: "ishita.banerjee@trainer.edu.in", firstName: "Ishita", lastName: "Banerjee" },
  { email: "arjun.rao@trainer.edu.in", firstName: "Arjun", lastName: "Rao" },
  { email: "madhuri.das@trainer.edu.in", firstName: "Madhuri", lastName: "Das" },
  { email: "sachin.khare@trainer.edu.in", firstName: "Sachin", lastName: "Khare" },
  { email: "shalini.chopra@trainer.edu.in", firstName: "Shalini", lastName: "Chopra" },
  { email: "karan.bajpai@trainer.edu.in", firstName: "Karan", lastName: "Bajpai" },
  { email: "tanya.modi@trainer.edu.in", firstName: "Tanya", lastName: "Modi" },
  { email: "rohit.shukla@trainer.edu.in", firstName: "Rohit", lastName: "Shukla" },
  { email: "nidhi.vyas@trainer.edu.in", firstName: "Nidhi", lastName: "Vyas" },
  { email: "aman.seth@trainer.edu.in", firstName: "Aman", lastName: "Seth" },
  { email: "prachi.tandon@trainer.edu.in", firstName: "Prachi", lastName: "Tandon" },
  { email: "lokesh.tripathi@trainer.edu.in", firstName: "Lokesh", lastName: "Tripathi" },
  { email: "smita.garg@trainer.edu.in", firstName: "Smita", lastName: "Garg" },
  { email: "ankit.bisht@trainer.edu.in", firstName: "Ankit", lastName: "Bisht" },
  { email: "namita.singhal@trainer.edu.in", firstName: "Namita", lastName: "Singhal" },
  { email: "hemant.negi@trainer.edu.in", firstName: "Hemant", lastName: "Negi" },
  { email: "surbhi.kohli@trainer.edu.in", firstName: "Surbhi", lastName: "Kohli" },
  { email: "nitesh.bhardwaj@trainer.edu.in", firstName: "Nitesh", lastName: "Bhardwaj" },
  { email: "rekha.thakkar@trainer.edu.in", firstName: "Rekha", lastName: "Thakkar" },
  { email: "jayesh.jha@trainer.edu.in", firstName: "Jayesh", lastName: "Jha" },
  { email: "roshni.menon@trainer.edu.in", firstName: "Roshni", lastName: "Menon" },
  { email: "saurabh.pandey@trainer.edu.in", firstName: "Saurabh", lastName: "Pandey" },
  { email: "meenakshi.pal@trainer.edu.in", firstName: "Meenakshi", lastName: "Pal" },
  { email: "tushar.ahluwalia@trainer.edu.in", firstName: "Tushar", lastName: "Ahluwalia" },
  { email: "urmila.bhatia@trainer.edu.in", firstName: "Urmila", lastName: "Bhatia" },
  { email: "chirag.dutta@trainer.edu.in", firstName: "Chirag", lastName: "Dutta" },
  { email: "varsha.kelkar@trainer.edu.in", firstName: "Varsha", lastName: "Kelkar" },
  { email: "deepak.ranjan@trainer.edu.in", firstName: "Deepak", lastName: "Ranjan" },
  { email: "jyoti.ganguly@trainer.edu.in", firstName: "Jyoti", lastName: "Ganguly" },
  { email: "ashish.solanki@trainer.edu.in", firstName: "Ashish", lastName: "Solanki" },
  { email: "payal.mukherjee@trainer.edu.in", firstName: "Payal", lastName: "Mukherjee" },
  { email: "bhavesh.parekh@trainer.edu.in", firstName: "Bhavesh", lastName: "Parekh" },
  { email: "richa.kashyap@trainer.edu.in", firstName: "Richa", lastName: "Kashyap" },
  { email: "chetan.mathur@trainer.edu.in", firstName: "Chetan", lastName: "Mathur" },
  { email: "sunaina.bhalla@trainer.edu.in", firstName: "Sunaina", lastName: "Bhalla" },
  { email: "vinay.bhatnagar@trainer.edu.in", firstName: "Vinay", lastName: "Bhatnagar" },
  { email: "swapna.mitra@trainer.edu.in", firstName: "Swapna", lastName: "Mitra" },
  { email: "himanshu.lal@trainer.edu.in", firstName: "Himanshu", lastName: "Lal" },
  { email: "vandana.trivedi@trainer.edu.in", firstName: "Vandana", lastName: "Trivedi" },
  { email: "sandeep.mohan@trainer.edu.in", firstName: "Sandeep", lastName: "Mohan" },
  { email: "aditi.chatterjee@trainer.edu.in", firstName: "Aditi", lastName: "Chatterjee" },
  { email: "puneet.gill@trainer.edu.in", firstName: "Puneet", lastName: "Gill" },
  { email: "seema.sood@trainer.edu.in", firstName: "Seema", lastName: "Sood" },
  { email: "lalit.wadhwa@trainer.edu.in", firstName: "Lalit", lastName: "Wadhwa" },
  { email: "farida.ansari@trainer.edu.in", firstName: "Farida", lastName: "Ansari" }
];

// =================== EQUIPMENT CONFIGURATIONS ===================
const EQUIPMENT_CONFIGS = {
  FITTER_MANUFACTURING: [
    { name: "Bench Drilling Machine BD-450", manufacturer: "Siemens AG", healthRange: [85, 98], faultyChance: 0.15 },
    { name: "Angle Grinder AG-2000 Professional", manufacturer: "Robert Bosch GmbH", healthRange: [75, 95], faultyChance: 0.20 },
    { name: "Arc Welding Station ARC-300", manufacturer: "ABB Ltd", healthRange: [80, 96], faultyChance: 0.18 },
    { name: "Gas Welding Setup OXY-AC-100", manufacturer: "Schneider Electric", healthRange: [82, 97], faultyChance: 0.12 },
    { name: "MIG Welder Unit MIG-250", manufacturer: "FANUC Corporation", healthRange: [78, 94], faultyChance: 0.22 },
    { name: "Precision Bench Vice BV-6", manufacturer: "Haas Automation", healthRange: [88, 99], faultyChance: 0.08 },
    { name: "Hydraulic Press HP-20T", manufacturer: "DMG Mori", healthRange: [70, 92], faultyChance: 0.25 }
  ],
  ELECTRICAL_ENGINEERING: [
    { name: "Electrician Training Panel ETP-5000", manufacturer: "Schneider Electric", healthRange: [83, 97], faultyChance: 0.14 },
    { name: "PLC & VFD Advanced System", manufacturer: "Siemens AG", healthRange: [86, 98], faultyChance: 0.10 },
    { name: "Digital Multimeter Station DMS-10", manufacturer: "Omron Corporation", healthRange: [90, 99], faultyChance: 0.06 },
    { name: "Oscilloscope Unit OSC-100MHz", manufacturer: "Delta Electronics", healthRange: [84, 96], faultyChance: 0.13 },
    { name: "Power Supply Module PSM-30V", manufacturer: "ABB Ltd", healthRange: [82, 95], faultyChance: 0.16 },
    { name: "Circuit Analysis Board CAB-Pro", manufacturer: "Mitsubishi Electric", healthRange: [88, 98], faultyChance: 0.09 },
    { name: "Motor Control Panel MCP-3Ph", manufacturer: "Yaskawa Electric", healthRange: [79, 94], faultyChance: 0.19 }
  ],
  WELDING_FABRICATION: [
    { name: "Arc Welding Machine 200-300A", manufacturer: "ABB Ltd", healthRange: [76, 93], faultyChance: 0.21 },
    { name: "Oxy-Acetylene Welding Kit Premium", manufacturer: "Robert Bosch GmbH", healthRange: [81, 96], faultyChance: 0.15 },
    { name: "MIG/CO2 Welding Station 400A", manufacturer: "FANUC Corporation", healthRange: [74, 91], faultyChance: 0.24 },
    { name: "VR Welding Simulator WeldSim-Pro", manufacturer: "Siemens AG", healthRange: [89, 99], faultyChance: 0.07 },
    { name: "Plasma Cutting System PCS-50", manufacturer: "Mazak Corporation", healthRange: [77, 94], faultyChance: 0.20 },
    { name: "Fume Extraction Unit FEU-5000", manufacturer: "Schneider Electric", healthRange: [85, 97], faultyChance: 0.11 },
    { name: "TIG Welding Machine TIG-200AC/DC", manufacturer: "DMG Mori", healthRange: [73, 90], faultyChance: 0.26 }
  ],
  TOOL_DIE_MAKING: [
    { name: "EDM Machine Electrical Discharge", manufacturer: "Makino Milling", healthRange: [80, 95], faultyChance: 0.17 },
    { name: "CNC Jig Boring Machine JB-2000", manufacturer: "DMG Mori", healthRange: [83, 96], faultyChance: 0.14 },
    { name: "Surface Grinder SG-500", manufacturer: "Okuma Corporation", healthRange: [78, 93], faultyChance: 0.19 },
    { name: "Tool & Cutter Grinder TCG-350", manufacturer: "Haas Automation", healthRange: [81, 95], faultyChance: 0.16 },
    { name: "Wire EDM Machine WEDM-300", manufacturer: "Mazak Corporation", healthRange: [84, 97], faultyChance: 0.13 },
    { name: "Precision Lathe PL-600", manufacturer: "FANUC Corporation", healthRange: [79, 94], faultyChance: 0.18 },
    { name: "Milling Machine Universal Mill-5", manufacturer: "Siemens AG", healthRange: [77, 92], faultyChance: 0.20 }
  ],
  ADDITIVE_MANUFACTURING: [
    { name: "FDM 3D Printer Ultimaker S5", manufacturer: "Siemens AG", healthRange: [87, 98], faultyChance: 0.10 },
    { name: "Resin 3D Printer Formlabs 3+", manufacturer: "Robert Bosch GmbH", healthRange: [85, 97], faultyChance: 0.12 },
    { name: "Laser Engraver CO2 LE-100W", manufacturer: "DMG Mori", healthRange: [82, 95], faultyChance: 0.15 },
    { name: "CNC Laser Cutter LC-150W", manufacturer: "Mazak Corporation", healthRange: [80, 94], faultyChance: 0.17 },
    { name: "Post-Curing Station UV-Chamber", manufacturer: "Schneider Electric", healthRange: [90, 99], faultyChance: 0.06 },
    { name: "Filament Dryer FD-Pro", manufacturer: "Delta Electronics", healthRange: [92, 99], faultyChance: 0.05 },
    { name: "3D Scanner Handheld HS-2000", manufacturer: "ABB Ltd", healthRange: [86, 97], faultyChance: 0.11 }
  ],
  SOLAR_INSTALLER_PV: [
    { name: "Solar Inverter Training Unit 5kW", manufacturer: "Schneider Electric", healthRange: [84, 96], faultyChance: 0.13 },
    { name: "PV Panel Testing Station PVTS-10", manufacturer: "ABB Ltd", healthRange: [88, 98], faultyChance: 0.09 },
    { name: "Battery Bank Simulator 48V-200Ah", manufacturer: "Siemens AG", healthRange: [81, 95], faultyChance: 0.16 },
    { name: "Solar Irradiance Meter SIM-2000", manufacturer: "Omron Corporation", healthRange: [90, 99], faultyChance: 0.06 },
    { name: "Installation Tool Kit Professional", manufacturer: "Robert Bosch GmbH", healthRange: [85, 97], faultyChance: 0.11 },
    { name: "Charge Controller Testing Unit", manufacturer: "Delta Electronics", healthRange: [83, 96], faultyChance: 0.14 },
    { name: "Grid Tie System Simulator GTSS-5", manufacturer: "Mitsubishi Electric", healthRange: [79, 94], faultyChance: 0.18 }
  ],
  MATERIAL_TESTING_QUALITY: [
    { name: "Universal Testing Machine UTM-100kN", manufacturer: "Makino Milling", healthRange: [82, 96], faultyChance: 0.15 },
    { name: "Compression Testing Machine CTM-2000", manufacturer: "DMG Mori", healthRange: [80, 95], faultyChance: 0.17 },
    { name: "Charpy Impact Tester CIT-300J", manufacturer: "Okuma Corporation", healthRange: [84, 97], faultyChance: 0.13 },
    { name: "Rockwell Hardness Tester RHT-Pro", manufacturer: "Haas Automation", healthRange: [87, 98], faultyChance: 0.10 },
    { name: "Brinell Hardness Tester BHT-3000", manufacturer: "Mazak Corporation", healthRange: [86, 97], faultyChance: 0.11 },
    { name: "Optical Comparator OC-400", manufacturer: "Siemens AG", healthRange: [89, 99], faultyChance: 0.08 },
    { name: "Environmental Test Chamber ETC-1000L", manufacturer: "Schneider Electric", healthRange: [78, 93], faultyChance: 0.19 },
    { name: "Metallurgical Microscope MM-5000", manufacturer: "ABB Ltd", healthRange: [91, 99], faultyChance: 0.05 }
  ],
  ADVANCED_MANUFACTURING_CNC: [
    { name: "CNC VMC 3-Axis Haas VF-2", manufacturer: "Haas Automation", healthRange: [81, 95], faultyChance: 0.16 },
    { name: "CNC VMC 4-Axis DMG Mori", manufacturer: "DMG Mori", healthRange: [83, 96], faultyChance: 0.14 },
    { name: "CNC Lathe 2-Axis Mazak QuickTurn", manufacturer: "Mazak Corporation", healthRange: [79, 94], faultyChance: 0.18 },
    { name: "CNC Lathe with Live Tools", manufacturer: "Okuma Corporation", healthRange: [82, 95], faultyChance: 0.15 },
    { name: "CNC Router 5-Axis AXYZ", manufacturer: "Makino Milling", healthRange: [80, 94], faultyChance: 0.17 },
    { name: "CNC Plasma Cutter Hypertherm", manufacturer: "FANUC Corporation", healthRange: [77, 92], faultyChance: 0.20 },
    { name: "CAD/CAM Workstation Pro-1", manufacturer: "Siemens AG", healthRange: [90, 99], faultyChance: 0.06 },
    { name: "CAD/CAM Workstation Pro-2", manufacturer: "Siemens AG", healthRange: [89, 98], faultyChance: 0.07 },
    { name: "Tool Presetter Digital TP-3000", manufacturer: "Mitsubishi Electric", healthRange: [86, 97], faultyChance: 0.11 }
  ],
  AUTOMOTIVE_MECHANIC: [
    { name: "Petrol Engine Training Model 4-Cyl", manufacturer: "Robert Bosch GmbH", healthRange: [80, 95], faultyChance: 0.17 },
    { name: "Diesel Engine Test Bench 6-Cyl", manufacturer: "Siemens AG", healthRange: [78, 93], faultyChance: 0.19 },
    { name: "Transmission Training Unit Manual", manufacturer: "ABB Ltd", healthRange: [83, 96], faultyChance: 0.14 },
    { name: "Automatic Transmission Simulator", manufacturer: "Schneider Electric", healthRange: [81, 95], faultyChance: 0.16 },
    { name: "Brake System Hydraulic Trainer", manufacturer: "Yaskawa Electric", healthRange: [85, 97], faultyChance: 0.12 },
    { name: "Electrical System Training Board", manufacturer: "Delta Electronics", healthRange: [88, 98], faultyChance: 0.09 },
    { name: "AC System Trainer R134a", manufacturer: "Omron Corporation", healthRange: [82, 96], faultyChance: 0.15 },
    { name: "Suspension & Steering Trainer", manufacturer: "Mitsubishi Electric", healthRange: [79, 94], faultyChance: 0.18 }
  ]
};

const STATUSES = ["OPERATIONAL", "IN_USE", "IDLE", "MAINTENANCE", "FAULTY"];
const MAINTENANCE_TYPES = ["Preventive Maintenance", "Corrective Maintenance", "Calibration", "Inspection", "Cleaning", "Parts Replacement"];

// Helper functions
function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomDate(daysBack) {
  return new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
}

function getEquipmentStatus(healthScore, isFaulty) {
  if (isFaulty) return "FAULTY";
  if (healthScore < 75) return "MAINTENANCE";
  if (Math.random() > 0.7) return "IN_USE";
  if (Math.random() > 0.5) return "OPERATIONAL";
  return "IDLE";
}

async function main() {
  console.log("🌱 Starting comprehensive seed...");
  console.log("🔐 Universal Password: " + UNIVERSAL_PASSWORD);
  
  // =================== CLEAN EXISTING DATA ===================
  console.log("\n🧹 Cleaning existing data...");
  await prisma.reorderRequest.deleteMany();
  await prisma.breakdownEquipment.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.usageAnalytics.deleteMany();
  await prisma.sensorData.deleteMany();
  await prisma.departmentAnalytics.deleteMany();
  await prisma.equipmentStatus.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.institute.deleteMany();

  // =================== CREATE INSTITUTES ===================
  console.log("\n🏢 Creating institutes...");
  const institutes = [];
  for (const inst of INSTITUTES_DATA) {
    const institute = await prisma.institute.create({ data: inst });
    institutes.push(institute);
    console.log(`  ✓ ${institute.name}`);
  }

  // =================== CREATE LABS (2 per department per institute) ===================
  console.log("\n🔬 Creating labs (2 labs per department)...");
  const labs = [];
  for (let i = 0; i < institutes.length; i++) {
    const institute = institutes[i];
    for (let deptIdx = 0; deptIdx < DEPARTMENTS.length; deptIdx++) {
      const department = DEPARTMENTS[deptIdx];
      // Create 2 labs per department
      for (let labNum = 1; labNum <= 2; labNum++) {
        const lab = await prisma.lab.create({
          data: {
            labId: `${institute.instituteId}_${department}_LAB_${labNum}`,
            name: `${institute.name} - ${department.replace(/_/g, " ")} Lab ${labNum}`,
            instituteId: institute.instituteId,
            department
          }
        });
        labs.push(lab);
        console.log(`  ✓ ${lab.name}`);
      }
    }
  }

  // =================== CREATE USERS ===================
  const hashedPassword = await bcrypt.hash(UNIVERSAL_PASSWORD, 10);
  
  // Policy Makers
  console.log("\n👔 Creating Policy Makers...");
  const policyMakers = [];
  for (const pm of POLICY_MAKERS) {
    const user = await prisma.user.create({
      data: {
        email: pm.email,
        password: hashedPassword,
        firstName: pm.firstName,
        lastName: pm.lastName,
        role: "POLICY_MAKER",
        emailVerified: true,
        isActive: true
      }
    });
    policyMakers.push(user);
    console.log(`  ✓ ${user.firstName} ${user.lastName} - ${user.email}`);
  }

  // Lab Managers
  console.log("\n👨‍💼 Creating Lab Managers...");
  const labManagers = [];
  for (const lm of LAB_MANAGERS) {
    const institute = institutes[lm.instituteIndex];
    const instituteLabs = labs.filter(l => l.instituteId === institute.instituteId);
    const lab = instituteLabs[0]; // Assign to first lab
    
    const user = await prisma.user.create({
      data: {
        email: lm.email,
        password: hashedPassword,
        firstName: lm.firstName,
        lastName: lm.lastName,
        role: "LAB_MANAGER",
        department: lab.department,
        instituteId: institute.instituteId,
        labId: lab.id,
        emailVerified: true,
        isActive: true
      }
    });
    labManagers.push(user);
    console.log(`  ✓ ${user.firstName} ${user.lastName} - ${user.email} (${institute.name})`);
  }

  // Trainers (3-4 per lab)
  console.log("\n👨‍🏫 Creating Trainers...");
  const trainers = [];
  let trainerIndex = 0;
  
  for (const lab of labs) {
    const numTrainers = 3 + Math.floor(Math.random() * 2); // 3-4 trainers per lab
    
    for (let i = 0; i < numTrainers && trainerIndex < TRAINERS.length; i++) {
      const trainerData = TRAINERS[trainerIndex];
      const user = await prisma.user.create({
        data: {
          email: trainerData.email,
          password: hashedPassword,
          firstName: trainerData.firstName,
          lastName: trainerData.lastName,
          role: "TRAINER",
          department: lab.department,
          instituteId: lab.instituteId,
          labId: lab.id,
          emailVerified: true,
          isActive: true
        }
      });
      trainers.push(user);
      trainerIndex++;
    }
  }
  console.log(`  ✓ Created ${trainers.length} trainers across all labs`);

  // =================== CREATE EQUIPMENT ===================
  console.log("\n⚙️ Creating equipment...");
  let equipmentIdCounter = 1;
  let firebaseLabFound = false;
  const allEquipment = [];
  const faultyEquipment = [];
  
  for (const lab of labs) {
    const configs = EQUIPMENT_CONFIGS[lab.department] || [];
    const numEquipment = 6 + Math.floor(Math.random() * 4); // 6-9 equipment per lab
    
    // Firebase lab: First ADVANCED_MANUFACTURING_CNC lab in ITI_JAIPUR with LAB_1
    const isFirebaseLab = !firebaseLabFound && 
                          lab.department === "ADVANCED_MANUFACTURING_CNC" &&
                          lab.instituteId === "ITI_JAIPUR" &&
                          lab.labId.includes("LAB_1");
    
    if (isFirebaseLab) {
      firebaseLabFound = true;
      console.log(`\n  🔥 Firebase-Enabled Lab: ${lab.name}`);
    }
    
    for (let i = 0; i < Math.min(numEquipment, configs.length); i++) {
      const config = configs[i];
      const isFaulty = Math.random() < config.faultyChance;
      const healthScore = isFaulty 
        ? randomInRange(40, 65) 
        : randomInRange(config.healthRange[0], config.healthRange[1]);
      
      const status = getEquipmentStatus(healthScore, isFaulty);
      const temperature = randomInRange(22, 75);
      const vibration = randomInRange(0.1, 4.8);
      const energyConsumption = randomInRange(120, 480);
      
      const firebaseDeviceId = isFirebaseLab && i < 9 ? FIREBASE_DEVICE_IDS[i] : null;
      
      const equipment = await prisma.equipment.create({
        data: {
          equipmentId: `EQ-${String(equipmentIdCounter).padStart(4, "0")}`,
          name: config.name,
          department: lab.department,
          manufacturer: config.manufacturer,
          model: `${config.manufacturer.split(" ")[0]}-${1000 + Math.floor(Math.random() * 9000)}`,
          serialNumber: `SN${Date.now()}${equipmentIdCounter}`,
          purchaseDate: randomDate(365 * 5),
          warrantyExpiry: new Date(2025 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1),
          labId: lab.id,
          firebaseDeviceId,
          isActive: true,
          status: {
            create: {
              status,
              healthScore,
              temperature,
              vibration,
              energyConsumption,
              lastMaintenanceDate: randomDate(90),
              nextMaintenanceDate: new Date(Date.now() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000)
            }
          },
          analyticsParams: {
            create: {
              department: lab.department,
              temperature,
              vibration,
              energyConsumption,
              efficiency: randomInRange(75, 95),
              totalUptime: randomInRange(100, 800),
              totalDowntime: randomInRange(5, 50),
              utilizationRate: randomInRange(55, 92),
              voltage: randomInRange(215, 235),
              current: randomInRange(3, 15),
              powerFactor: randomInRange(0.82, 0.95)
            }
          }
        }
      });
      
      allEquipment.push(equipment);
      if (isFaulty) faultyEquipment.push({ equipment, lab });
      
      // Historical sensor data (last 48 hours)
      const now = Date.now();
      for (let hour = 0; hour < 48; hour++) {
        await prisma.sensorData.create({
          data: {
            equipmentId: equipment.id,
            temperature: randomInRange(20, 80),
            vibration: randomInRange(0.1, 5),
            energyConsumption: randomInRange(100, 500),
            timestamp: new Date(now - hour * 60 * 60 * 1000)
          }
        });
      }
      
      // Maintenance records (70% chance)
      if (Math.random() > 0.3 && labManagers.length > 0) {
        const randomManager = labManagers[Math.floor(Math.random() * labManagers.length)];
        const maintenanceType = MAINTENANCE_TYPES[Math.floor(Math.random() * MAINTENANCE_TYPES.length)];
        
        await prisma.maintenanceRecord.create({
          data: {
            equipmentId: equipment.id,
            markedBy: randomManager.id,
            maintenanceType,
            notes: `${maintenanceType} completed. Equipment inspected and verified operational.`,
            maintenanceDate: randomDate(60)
          }
        });
      }
      
      if (firebaseDeviceId) {
        console.log(`    🔥 ${equipment.name} → Firebase: ${firebaseDeviceId}`);
      }
      
      equipmentIdCounter++;
    }
    
    console.log(`  ✓ ${lab.name}: ${Math.min(numEquipment, configs.length)} equipment`);
  }

  // =================== CREATE ALERTS ===================
  console.log("\n⚠️ Creating alerts for faulty equipment...");
  const alerts = [];
  for (const { equipment } of faultyEquipment) {
    const alertTypes = [
      { type: "FAULT_DETECTED", severity: "CRITICAL", title: "Equipment Fault Detected", message: "Critical fault detected in equipment operation" },
      { type: "HIGH_TEMPERATURE", severity: "HIGH", title: "High Temperature Alert", message: "Temperature exceeded safe operating limits" },
      { type: "ABNORMAL_VIBRATION", severity: "HIGH", title: "Abnormal Vibration", message: "Vibration levels significantly higher than normal" },
      { type: "LOW_HEALTH_SCORE", severity: "MEDIUM", title: "Low Health Score", message: "Equipment health score below acceptable threshold" }
    ];
    
    const alertConfig = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const alert = await prisma.alert.create({
      data: {
        equipmentId: equipment.id,
        type: alertConfig.type,
        severity: alertConfig.severity,
        title: alertConfig.title,
        message: `${alertConfig.message} for ${equipment.name}`,
        isResolved: Math.random() > 0.6,
        createdAt: randomDate(30)
      }
    });
    alerts.push(alert);
  }
  console.log(`  ✓ Created ${alerts.length} alerts`);

  // =================== CREATE BREAKDOWNS & REORDER REQUESTS ===================
  console.log("\n🔧 Creating breakdown reports and reorder requests...");
  const breakdowns = [];
  const reorderRequests = [];
  
  // Select 40% of faulty equipment for breakdowns
  const breakdownEquipment = faultyEquipment.slice(0, Math.ceil(faultyEquipment.length * 0.4));
  
  for (const { equipment, lab } of breakdownEquipment) {
    const labTrainers = trainers.filter(t => t.labId === lab.id);
    if (labTrainers.length === 0) continue;
    
    const reporter = labTrainers[Math.floor(Math.random() * labTrainers.length)];
    const breakdown = await prisma.breakdownEquipment.create({
      data: {
        equipmentId: equipment.id,
        reportedBy: reporter.id,
        reason: `Equipment malfunction detected - ${equipment.name} requires immediate attention`,
        reportedAt: randomDate(20),
        isAutoDetected: Math.random() > 0.5,
        status: "REORDER_PENDING"
      }
    });
    breakdowns.push(breakdown);
    
    // Create reorder request (80% chance)
    if (Math.random() > 0.2) {
      const labManager = labManagers.find(lm => lm.instituteId === lab.instituteId);
      const urgencies = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
      const statuses = ["PENDING", "APPROVED", "REJECTED"];
      const reqStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const reorder = await prisma.reorderRequest.create({
        data: {
          breakdownId: breakdown.id,
          requestedBy: reporter.id,
          equipmentName: equipment.name,
          quantity: 1,
          urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
          reason: `Replacement needed due to critical malfunction in ${equipment.name}`,
          estimatedCost: randomInRange(10000, 500000),
          status: reqStatus,
          reviewedBy: reqStatus !== "PENDING" ? labManager?.id : null,
          reviewedAt: reqStatus !== "PENDING" ? randomDate(10) : null,
          reviewComments: reqStatus === "APPROVED" 
            ? "Approved for procurement. Critical equipment replacement authorized." 
            : reqStatus === "REJECTED" 
            ? "Rejected - repair option available at lower cost." 
            : null,
          requestedAt: randomDate(15)
        }
      });
      reorderRequests.push(reorder);
    }
  }
  
  console.log(`  ✓ Created ${breakdowns.length} breakdown reports`);
  console.log(`  ✓ Created ${reorderRequests.length} reorder requests`);

  // =================== SUMMARY ===================
  console.log("\n" + "=".repeat(80));
  console.log("✅ COMPREHENSIVE SEED COMPLETED!");
  console.log("=".repeat(80));
  
  console.log("\n📊 DATABASE SUMMARY:");
  console.log(`  • ${institutes.length} Institutes`);
  console.log(`  • ${labs.length} Labs (2 per department × 9 departments × 5 institutes)`);
  console.log(`  • ${policyMakers.length} Policy Makers`);
  console.log(`  • ${labManagers.length} Lab Managers (2 per institute)`);
  console.log(`  • ${trainers.length} Trainers (3-4 per lab)`);
  console.log(`  • ${allEquipment.length} Equipment (6-9 per lab)`);
  console.log(`  • ${faultyEquipment.length} Faulty Equipment`);
  console.log(`  • ${alerts.length} Active Alerts`);
  console.log(`  • ${breakdowns.length} Breakdown Reports`);
  console.log(`  • ${reorderRequests.length} Reorder Requests`);
  
  console.log("\n🔐 LOGIN CREDENTIALS:");
  console.log("  Universal Password: " + UNIVERSAL_PASSWORD);
  
  console.log("\n  📋 POLICY MAKERS:");
  policyMakers.forEach(pm => console.log(`    • ${pm.email}`));
  
  console.log("\n  📋 LAB MANAGERS:");
  labManagers.forEach(lm => console.log(`    • ${lm.email}`));
  
  console.log("\n  📋 SAMPLE TRAINERS (first 10):");
  trainers.slice(0, 10).forEach(t => console.log(`    • ${t.email}`));
  console.log(`    ... and ${trainers.length - 10} more trainers`);
  
  console.log("\n🔥 FIREBASE INTEGRATION:");
  const firebaseLab = labs.find(l => 
    l.department === "ADVANCED_MANUFACTURING_CNC" && 
    l.instituteId === "ITI_JAIPUR" && 
    l.labId.includes("LAB_1")
  );
  console.log(`  • Lab: ${firebaseLab?.name}`);
  console.log(`  • Device IDs: ${FIREBASE_DEVICE_IDS.join(", ")}`);
  console.log(`  • 9 equipment connected to Firebase for real-time tracking`);
  
  console.log("\n" + "=".repeat(80));
}

main()
  .catch((e) => {
    console.error("\n❌ SEED FAILED:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });