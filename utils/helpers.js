const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Generates a JWT token
 * @param {string} userId 
 * @param {string} role 
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

/**
 * Validates email format
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Handles Supabase storage file upload
 * @param {Buffer} fileBuffer 
 * @param {string} fileName 
 * @param {string} mimeType 
 * @returns {Promise<{url: string, path: string}>}
 */
const uploadToSupabase = async (fileBuffer, fileName, mimeType) => {
  const filePath = `uploads/${Date.now()}_${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('classroom-files')
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('classroom-files')
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path
  };
};

/**
 * Deletes a file from Supabase storage
 * @param {string} filePath 
 * @returns {Promise<void>}
 */
const deleteFromSupabase = async (filePath) => {
  const { error } = await supabase.storage
    .from('classroom-files')
    .remove([filePath]);

  if (error) throw new Error(`File deletion failed: ${error.message}`);
};

/**
 * Formats file size in human-readable format
 * @param {number} bytes 
 * @returns {string}
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
};

/**
 * Extracts file extension
 * @param {string} fileName 
 * @returns {string}
 */
const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase();
};

/**
 * Validates allowed file types
 * @param {string} extension 
 * @param {string[]} allowedTypes 
 * @returns {boolean}
 */
const isValidFileType = (extension, allowedTypes = ['pdf', 'docx', 'ppt', 'jpg', 'png']) => {
  return allowedTypes.includes(extension);
};

/**
 * Generates a random ID
 * @param {number} length 
 * @returns {string}
 */
const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2);
};

/**
 * Handles async middleware errors
 * @param {Function} fn 
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  generateToken,
  isValidEmail,
  uploadToSupabase,
  deleteFromSupabase,
  formatFileSize,
  getFileExtension,
  isValidFileType,
  generateId,
  asyncHandler
};