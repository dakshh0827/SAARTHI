// backend/services/firebase.service.js - UPDATED WITH SOCKET.IO
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import prisma from "../config/database.js";
import logger from "../utils/logger.js";
import { broadcastEquipmentStatus } from "../config/socketio.js"; // ← ADD THIS

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

  async startListening(firebaseDeviceId, equipmentId) {
    if (this.activeListeners.has(firebaseDeviceId)) {
      logger.info(`Already listening to ${firebaseDeviceId}`);
      return;
    }

    const deviceRef = ref(db, `UsersData/${firebaseDeviceId}/readings`);
    
    logger.info(`📡 Setting up listener for: UsersData/${firebaseDeviceId}/readings`);

    const unsubscribe = onValue(
      deviceRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          logger.info(`📊 Firebase data received for ${firebaseDeviceId}`);

          const timestamps = Object.keys(data);
          
          if (timestamps.length === 0) {
            logger.warn(`⚠️ No readings found for ${firebaseDeviceId}`);
            return;
          }

          const latestTimestamp = timestamps.sort().reverse()[0];
          const latestReading = data[latestTimestamp];

          logger.info(`🔥 Latest reading for ${firebaseDeviceId}:`, {
            timestamp: latestTimestamp,
            data: latestReading
          });

          await this.processReading(equipmentId, latestReading, firebaseDeviceId);
        } else {
          logger.warn(`⚠️ No data exists at UsersData/${firebaseDeviceId}/readings`);
        }
      },
      (error) => {
        logger.error(`❌ Firebase listener error for ${firebaseDeviceId}:`, error);
      }
    );

    this.activeListeners.set(firebaseDeviceId, unsubscribe);
    logger.info(`✅ Firebase listener active for ${firebaseDeviceId}`);
  }

  async processReading(equipmentId, reading, firebaseDeviceId) {
    try {
      logger.info(`🔧 Processing reading for equipment ${equipmentId}:`, reading);

      // --- OLD CODE (The Problem) ---
      // const { temperature, timestamp } = reading;
      // const vibration = temperature > 60 ? (temperature - 50) / 20 : Math.random() * 2;
      // const energyConsumption = 150 + (temperature * 3);

      // --- NEW CODE (The Fix) ---
      // Destructure all values from the reading
      let { temperature, vibration, energyConsumption, timestamp } = reading;

      if (!temperature) {
        logger.warn(`⚠️ No temperature data in reading for ${firebaseDeviceId}`);
        return;
      }

      // Optional: Keep the calculation ONLY as a fallback if Firebase doesn't send the data
      if (vibration === undefined || vibration === null) {
         vibration = temperature > 60 ? (temperature - 50) / 20 : Math.random() * 2;
      }

      if (energyConsumption === undefined || energyConsumption === null) {
         energyConsumption = 150 + (temperature * 3);
      }

      logger.info(`💾 Storing sensor data for equipment ${equipmentId}`);

      // ... rest of your code (prisma.sensorData.create, etc.)

      // 1. Store in SensorData
      await prisma.sensorData.create({
        data: {
          equipmentId,
          temperature,
          vibration,
          energyConsumption,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        }
      });

      // 2. Update EquipmentStatus
      const updatedStatus = await prisma.equipmentStatus.update({
        where: { equipmentId },
        data: {
          temperature,
          vibration,
          energyConsumption,
          lastUsedAt: new Date(),
        },
        include: {
          equipment: {
            select: {
              id: true,
              equipmentId: true,
              name: true,
              firebaseDeviceId: true,
            }
          }
        }
      });

      logger.info(`✅ EquipmentStatus updated for equipment ${equipmentId}`);

      // 3. Update DepartmentAnalytics
      await prisma.departmentAnalytics.updateMany({
        where: { equipmentId },
        data: {
          temperature,
          vibration,
          energyConsumption,
        }
      });

      logger.info(`✅ Analytics updated for equipment ${equipmentId}`);

      // 🚀 4. BROADCAST VIA SOCKET.IO - THIS IS THE KEY!
      broadcastEquipmentStatus(equipmentId, {
        ...updatedStatus,
        temperature,
        vibration,
        energyConsumption,
        firebaseDeviceId,
        updatedAt: new Date(),
      });

      logger.info(`📡 Socket.IO broadcast sent for equipment ${equipmentId}`);
      logger.info(`🎉 Successfully processed reading from ${firebaseDeviceId}`);

    } catch (error) {
      logger.error(`❌ Error processing Firebase reading for equipment ${equipmentId}:`, {
        error: error.message,
        stack: error.stack
      });
    }
  }

  async startAllListeners() {
    logger.info('🔥 Starting all Firebase listeners...');

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

    logger.info(`📡 Found ${equipment.length} equipment with Firebase devices`);

    for (const eq of equipment) {
      logger.info(`🔥 Starting Firebase listener for device: ${eq.firebaseDeviceId} (Equipment: ${eq.id})`);
      await this.startListening(eq.firebaseDeviceId, eq.id);
    }

    logger.info(`✅ Started ${equipment.length} Firebase listeners`);
  }

  stopAllListeners() {
    for (const [deviceId, unsubscribe] of this.activeListeners) {
      unsubscribe();
      logger.info(`Stopped listening to ${deviceId}`);
    }
    this.activeListeners.clear();
  }
}

export default new FirebaseService();