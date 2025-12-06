// backend/prisma/updateMaintenanceDates.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to generate random date between March 2025 and November 2025
function randomDateBetween(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

async function updateMaintenanceDates() {
  console.log("🔧 Starting maintenance dates update...\n");

  try {
    // Define date range: March 2025 to November 2025
    const startDate = new Date("2025-03-01");
    const endDate = new Date("2025-11-30");

    // Fetch all equipment status records
    const equipmentStatuses = await prisma.equipmentStatus.findMany({
      select: {
        id: true,
        equipmentId: true,
        equipment: {
          select: {
            equipmentId: true,
            name: true
          }
        }
      }
    });

    console.log(`📊 Found ${equipmentStatuses.length} equipment status records to update\n`);

    let successCount = 0;
    let errorCount = 0;

    // Update each equipment status
    for (const status of equipmentStatuses) {
      try {
        // Generate random last maintenance date
        const randomLastMaintenanceDate = randomDateBetween(startDate, endDate);

        // Update the record
        await prisma.equipmentStatus.update({
          where: { id: status.id },
          data: {
            lastMaintenanceDate: randomLastMaintenanceDate,
            nextMaintenanceDate: null // Empty the next maintenance date
          }
        });

        successCount++;
        console.log(
          `✓ Updated ${status.equipment.equipmentId} (${status.equipment.name}): ` +
          `${randomLastMaintenanceDate.toLocaleDateString()}`
        );
      } catch (error) {
        errorCount++;
        console.error(
          `✗ Failed to update ${status.equipment.equipmentId}: ${error.message}`
        );
      }
    }

    // Summary
    console.log("\n" + "=".repeat(80));
    console.log("✅ UPDATE COMPLETED!");
    console.log("=".repeat(80));
    console.log(`\n📈 Results:`);
    console.log(`  • Successfully updated: ${successCount} records`);
    console.log(`  • Failed: ${errorCount} records`);
    console.log(`  • Total processed: ${equipmentStatuses.length} records`);
    console.log(`\n📅 Date Range: March 2025 - November 2025`);
    console.log(`\n🔄 Changes made:`);
    console.log(`  • lastMaintenanceDate: Set to random dates between Mar-Nov 2025`);
    console.log(`  • nextMaintenanceDate: Set to null (empty) for all equipment`);
    console.log("\n" + "=".repeat(80));

  } catch (error) {
    console.error("\n❌ UPDATE FAILED:");
    console.error(error);
    process.exit(1);
  }
}

updateMaintenanceDates()
  .catch((e) => {
    console.error("\n❌ SCRIPT ERROR:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\n👋 Database connection closed");
  });