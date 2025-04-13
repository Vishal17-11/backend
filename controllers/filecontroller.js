const supabase = require('../config/supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Upload file to Supabase Storage
exports.uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) throw new Error('No file uploaded');

      const fileName = `${Date.now()}_${req.file.originalname}`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('classroom-files')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('classroom-files')
        .getPublicUrl(fileName);

      res.json({ 
        name: req.file.originalname,
        url: urlData.publicUrl,
        size: req.file.size 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// List all files
exports.listFiles = async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from('classroom-files')
      .list();

    if (error) throw error;

    // Get public URLs
    const files = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from('classroom-files')
          .getPublicUrl(file.name);

        return {
          name: file.name,
          url: urlData.publicUrl,
          createdAt: file.created_at
        };
      })
    );

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};