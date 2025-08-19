import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import FileSend from 'file-send';
import url from 'url';

// Obtener el directorio actual del módulo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Ruta para subir imágenes
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo.' });
  }
  res.json({ message: 'Archivo subido con éxito', file: req.file });
});

// Ruta para servir imágenes estáticas
router.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

router.get('/uploads/*', (req, res, next) => {
  const filePath = path.join(__dirname, '../../public/uploads', url.parse(req.url).pathname.replace('/uploads/', ''));
  new FileSend(req, filePath, {
    root: path.join(__dirname, '../../public/uploads'),
    etag: true,
    maxAge: '30d'
  })
    .on('error', function (error) {
      // Manejo de errores
      res.status(500).json({ message: 'Error al servir el archivo', error: error.message });
    })
    .pipe(res);
});

export default router;