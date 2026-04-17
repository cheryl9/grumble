#!/usr/bin/env node

/**
 * Import buildings.json into PostgreSQL buildings table
 * Usage: node migrations/import_buildings_data.js
 *
 * This script:
 * 1. Reads buildings.json from migrations/data/
 * 2. Validates the table exists
 * 3. Imports records in batches of 1000 (avoids memory overload)
 * 4. Shows progress and summary
 */

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const BATCH_SIZE = 1000;
const DATA_FILE = path.join(__dirname, "data", "buildings.json");

async function importBuildingsData() {
  const startTime = Date.now();

  try {
    console.log("🏗️  Starting buildings data import...\n");

    // Step 1: Verify file exists
    console.log(`📂 Checking data file: ${DATA_FILE}`);
    if (!fs.existsSync(DATA_FILE)) {
      throw new Error(`File not found: ${DATA_FILE}`);
    }
    console.log("✅ File found\n");

    // Step 2: Load JSON data
    console.log("📖 Loading buildings.json...");
    const buildingsData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    console.log(`✅ Loaded ${buildingsData.length} records\n`);

    // Step 3: Verify table exists
    console.log("🔍 Verifying buildings table exists...");
    const tableCheck = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='buildings')`,
    );

    if (!tableCheck.rows[0].exists) {
      throw new Error(
        "buildings table does not exist. Run migration first: psql -f migrations/006_create_buildings_table.sql",
      );
    }
    console.log("✅ Table exists\n");

    // Step 4: Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing data...");
    const clearResult = await pool.query("TRUNCATE buildings RESTART IDENTITY");
    console.log(`✅ Cleared previous data\n`);

    // Step 5: Import data in batches
    console.log("📥 Importing data...");
    console.log(
      `   (${buildingsData.length} records in batches of ${BATCH_SIZE})\n`,
    );

    let totalInserted = 0;
    let batchNum = 0;

    for (let i = 0; i < buildingsData.length; i += BATCH_SIZE) {
      batchNum++;
      const batch = buildingsData.slice(i, i + BATCH_SIZE);

      // Build parameterized query for batch
      const values = batch
        .map(
          (_, idx) =>
            `($${idx * 7 + 1}, $${idx * 7 + 2}, $${idx * 7 + 3}, $${idx * 7 + 4}, $${idx * 7 + 5}, $${idx * 7 + 6}, $${idx * 7 + 7})`,
        )
        .join(",");

      const params = [];
      batch.forEach((record) => {
        params.push(
          record.POSTAL || null,
          parseFloat(record.LATITUDE) || null,
          parseFloat(record.LONGITUDE) || null,
          record.BUILDING || null,
          record.ADDRESS || null,
          record.ROAD_NAME || null,
          record.BLK_NO || null,
        );
      });

      const query = `
        INSERT INTO buildings 
        (postal_code, latitude, longitude, building_name, address, road_name, blk_no)
        VALUES ${values}
      `;

      try {
        await pool.query(query, params);
        totalInserted += batch.length;

        // Show progress every 10 batches
        if (batchNum % 10 === 0) {
          const percent = Math.round(
            (totalInserted / buildingsData.length) * 100,
          );
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const rate = Math.round(totalInserted / (elapsed || 1));
          console.log(
            `   Batch ${batchNum}: ${totalInserted.toLocaleString()} / ${buildingsData.length.toLocaleString()} (${percent}%) | ${rate} records/sec`,
          );
        }
      } catch (batchError) {
        console.error(`❌ Batch ${batchNum} failed:`, batchError.message);
        throw batchError;
      }
    }

    console.log("");

    // Step 6: Verify import
    console.log("🔍 Verifying import...");
    const countResult = await pool.query("SELECT COUNT(*) FROM buildings");
    const finalCount = parseInt(countResult.rows[0].count);
    console.log(
      `✅ Total records in database: ${finalCount.toLocaleString()}\n`,
    );

    // Step 7: Show sample data
    console.log("📋 Sample data (first 3 records):");
    const sampleResult = await pool.query(
      "SELECT postal_code, latitude, longitude, building_name FROM buildings LIMIT 3",
    );
    sampleResult.rows.forEach((row, idx) => {
      console.log(
        `   ${idx + 1}. Postal: ${row.postal_code}, Lat: ${row.latitude}, Lon: ${row.longitude}, Building: ${row.building_name}`,
      );
    });

    // Step 8: Final stats
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const avgRate = Math.round(finalCount / totalTime);

    console.log(`\n${"=".repeat(60)}`);
    console.log("✅ IMPORT COMPLETE!");
    console.log(`${"=".repeat(60)}`);
    console.log(`Records imported: ${finalCount.toLocaleString()}`);
    console.log(`Time taken: ${totalTime} seconds`);
    console.log(`Average rate: ${avgRate.toLocaleString()} records/sec`);
    console.log(`${"=".repeat(60)}\n`);

    // Step 9: Show index info
    console.log("📊 Index Information:");
    const indexResult = await pool.query(
      `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'buildings'`,
    );
    indexResult.rows.forEach((row) => {
      console.log(`   • ${row.indexname}`);
    });

    console.log("");
    console.log("🎉 Ready to use! Test with:");
    console.log(
      "   SELECT * FROM buildings WHERE postal_code = '018956' LIMIT 1;\n",
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ IMPORT FAILED\n");
    console.error("Error:", error.message);
    console.error("\nTroubleshooting:");
    console.error(
      "1. Ensure PostgreSQL is running and config/db.js is configured",
    );
    console.error("2. Run migration first: npm run migrate");
    console.error("3. Check that buildings.json exists in migrations/data/\n");
    process.exit(1);
  }
}

// Run import
importBuildingsData();
