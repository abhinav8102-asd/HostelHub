const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  console.log('Supabase storage client initialized successfully.');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
} else {
  console.log('Supabase credentials not found. Falling back to local disk storage.');
}

/**
 * Uploads a file (provided by Multer) to Supabase Storage or returns local fallback path
 * @param {Object} fileObject - The file object from req.file / req.files
 * @param {string} bucketName - The Supabase storage bucket name (default: 'hostelhub')
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
async function uploadFile(fileObject, bucketName = 'hostelhub') {
  if (!fileObject) return null;

  // If Supabase is configured, upload to cloud bucket
  if (supabase) {
    try {
      const fileBuffer = fs.readFileSync(fileObject.path);
      const uniqueFileName = `${Date.now()}-${path.basename(fileObject.originalname)}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(uniqueFileName, fileBuffer, {
          contentType: fileObject.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase Upload Error:', error.message);
        throw error;
      }

      // Retrieve the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uniqueFileName);

      // Delete the temporary file from local server disk
      try {
        fs.unlinkSync(fileObject.path);
      } catch (err) {
        console.error('Failed to delete temporary local file:', err);
      }

      return urlData.publicUrl;
    } catch (err) {
      console.error('Supabase cloud upload failed, using local fallback:', err);
    }
  }

  // Permanent Database Storage Fallback: Convert image buffer to Base64 Data URL
  try {
    let buffer;
    if (fileObject.buffer) {
      buffer = fileObject.buffer;
    } else if (fileObject.path && fs.existsSync(fileObject.path)) {
      buffer = fs.readFileSync(fileObject.path);
      // Clean up temporary disk file
      try { fs.unlinkSync(fileObject.path); } catch (e) {}
    }
    if (buffer) {
      const mime = fileObject.mimetype || 'image/jpeg';
      return `data:${mime};base64,${buffer.toString('base64')}`;
    }
  } catch (e) {
    console.error('Base64 conversion fallback error:', e);
  }

  return `/uploads/${fileObject.filename}`;
}

module.exports = {
  uploadFile
};
