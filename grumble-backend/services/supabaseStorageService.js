const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables (SUPABASE_URL and SUPABASE_KEY)",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload an image file to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The original filename
 * @param {string} bucket - The bucket name (default: "posts")
 * @returns {Promise<{url: string, path: string}>} Public URL and storage path
 */
async function uploadImage(fileBuffer, fileName, bucket = "posts") {
  try {
    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = fileName.split(".").pop();
    const uniqueFileName = `${timestamp}-${random}.${ext}`;
    const filePath = `${bucket}/${uniqueFileName}`;

    console.log(`📤 Uploading image: ${fileName} → ${filePath}`);
    console.log(`🪣 Bucket: images, Content-Type: image/${ext}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("posts")
      .upload(filePath, fileBuffer, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (error) {
      console.error("❌ Supabase upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    console.log(`✅ Upload successful, data:`, data);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("posts").getPublicUrl(filePath);

    console.log(`🌐 Public URL generated: ${publicUrl}`);

    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Image upload service error:", error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} filePath - The storage path of the file to delete
 */
async function deleteImage(filePath) {
  try {
    if (!filePath) return;

    // Extract just the path part if it's a full URL
    let path = filePath;
    if (filePath.includes("/storage/v1/object/public/posts/")) {
      path = filePath.split("/storage/v1/object/public/posts/")[1];
    }

    const { error } = await supabase.storage.from("posts").remove([path]);

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    console.log(`✅ Image deleted from Supabase: ${path}`);
  } catch (error) {
    console.error("Image deletion error:", error);
    // Don't throw - deletion failures shouldn't break the app
  }
}

module.exports = {
  uploadImage,
  deleteImage,
};
