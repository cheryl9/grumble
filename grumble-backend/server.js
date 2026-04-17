require("dotenv").config();
const app = require("./app");
const { syncFoodPlaces } = require("./services/syncService");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    console.log("🔄 Syncing OSM restaurant data on startup...");
    await syncFoodPlaces();
    console.log("✅ OSM sync complete. Starting server...\n");
  } catch (err) {
    console.error(
      "⚠️  OSM sync failed, but starting server anyway:",
      err.message,
      "\n",
    );
  }

  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
})();
