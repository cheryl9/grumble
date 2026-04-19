const { createClient } = require("@supabase/supabase-js");

let supabase = null;

/**
 * Get or create Supabase client (singleton)
 */
function getSupabase() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase ENV missing", {
      url: supabaseUrl,
      keyExists: !!supabaseKey,
    });
    return null; 
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

/**
 * Upload an image file to Supabase Storage
 */
async function uploadImage(fileBuffer, fileName, bucket = "posts") {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";

    const uniqueFileName = `${timestamp}-${random}.${ext}`;
    const filePath = `${bucket}/${uniqueFileName}`;

    console.log(`📤 Uploading image: ${fileName} → ${filePath}`);
    console.log(`🪣 Bucket: ${bucket}, Content-Type: image/${ext}`);

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (error) {
      console.error("❌ Supabase upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    console.log("✅ Upload successful:", data);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    console.log(`🌐 Public URL: ${publicUrl}`);

    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("❌ Image upload service error:", error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 */
async function deleteImage(filePath, bucket = "posts") {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.error("❌ Supabase not configured, skipping delete");
      return;
    }

    if (!filePath) return;

    // Extract path if full URL is passed
    let path = filePath;
    if (filePath.includes(`/storage/v1/object/public/${bucket}/`)) {
      path = filePath.split(`/storage/v1/object/public/${bucket}/`)[1];
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("❌ Supabase delete error:", error);
      throw error;
    }

    console.log(`✅ Image deleted: ${path}`);
  } catch (error) {
    console.error("❌ Image deletion error:", error);
  }
}

module.exports = {
  uploadImage,
  deleteImage,
};