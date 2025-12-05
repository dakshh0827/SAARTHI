import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, query, orderByKey, limitToLast } from "firebase/database";
import prisma from "../config/database.js";
import logger from "../utils/logger.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgUs59TXYUQR4D0okAU0OsSypsThl5l0A",
  authDomain: "sih-25-temp.firebaseapp.com",
  databaseURL: "https://sih-25-temp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sih-25-temp",
  storageBucket: "sih-25-temp.firebasestorage.app",
  messagingSenderId: "343588408716",
  appId: "1:343588408716:web:5a8cecc634f2400a581aa9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

class FirebaseService {
  constructor() {
    this.activeListeners = new Map();
  }

  // Start listening to a specific device
  async startListening(firebaseDeviceId, equipmentId) {
    if (this.activeListeners.has(firebaseDeviceId)) {
      logger.info(`Already listening to ${firebaseDeviceId}`);
      return;
    }

    const deviceRef = ref(db, `UsersData/${firebaseDeviceId}/readings`);
    const recentQuery = query(deviceRef, orderByKey(), limitToLast(1));

    const unsubscribe = onValue(recentQuery, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const latestKey = Object.keys(data)[0];
        const reading = data[latestKey];

        await this.processReading(equipmentId, reading);
      }
    });

    this.activeListeners.set(firebaseDeviceId, unsubscribe);
    logger.info(`Started listening to Firebase device: ${firebaseDeviceId}`);
  }

  // Process incoming reading
  async processReading(equipmentId, reading) {
    try {
      const { temperature, timestamp } = reading;

      // For now, we only get temperature from Firebase
      // Simulate vibration and energy based on temperature
      const vibration = temperature > 60 ? (temperature - 50) / 20 : Math.random() * 2;
      const energyConsumption = 150 + (temperature * 3);

      // Store in SensorData
      await prisma.sensorData.create({
        data: {
          equipmentId,
          temperature,
          vibration,
          energyConsumption,
          timestamp: new Date(timestamp),
        }
      });

      // Update EquipmentStatus
      await prisma.equipmentStatus.update({
        where: { equipmentId },
        data: {
          temperature,
          vibration,
          energyConsumption,
          lastUsedAt: new Date(),
        }
      });

      // Update DepartmentAnalytics
      await prisma.departmentAnalytics.updateMany({
        where: { equipmentId },
        data: {
          temperature,
          vibration,
          energyConsumption,
        }
      });

      logger.info(`Updated realtime data for equipment ${equipmentId}`);
    } catch (error) {
      logger.error(`Error processing Firebase reading: ${error.message}`);
    }
  }

  // Start listening to all equipment with Firebase IDs
  async startAllListeners() {
    const equipment = await prisma.equipment.findMany({
      where: {
        firebaseDeviceId: { not: null },
        isActive: true
      },
      select: {
        id: true,
        firebaseDeviceId: true,
        name: true
      }
    });

    for (const eq of equipment) {
      await this.startListening(eq.firebaseDeviceId, eq.id);
    }

    logger.info(`Started ${equipment.length} Firebase listeners`);
  }

  // Stop all listeners
  stopAllListeners() {
    for (const [deviceId, unsubscribe] of this.activeListeners) {
      unsubscribe();
      logger.info(`Stopped listening to ${deviceId}`);
    }
    this.activeListeners.clear();
  }
}

export default new FirebaseService();