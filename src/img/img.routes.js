import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier'; // Necesitarás instalar esto: npm i streamifier

// --- 1. Configuración de Cloudinary ---
// Se configura automáticamente si las variables de entorno están presentes.
// Asegúrate de tener CLOUDINARY_URL o las 3 variables individuales en Vercel.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --- 2. Configuración de Multer ---
// Usamos memoryStorage porque no necesitamos guardar el archivo en el disco de Vercel.
// Lo procesamos en memoria y lo enviamos directamente a Cloudinary.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo.' });
  }

  const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          // Puedes añadir opciones aquí, como la carpeta donde se guardará
          folder: 'ecommerce_products'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  };

  try {
    const result = await uploadFromBuffer(req.file.buffer);

    res.status(200).json({
      message: 'Archivo subido con éxito a Cloudinary',
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Error al subir a Cloudinary:', error);
    res.status(500).json({ message: 'Error al subir el archivo', error: error.message });
  }
});

export default router;