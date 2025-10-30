# 🛒 E-Commerce — Plataforma web completa con React, Node.js y SQL

**E-Commerce API** es el servidor backend del proyecto de tienda en línea, desarrollado con **Node.js, Express, MySQL y Sequelize**.
Incluye autenticación segura con **JWT**, validación de datos, gestión de usuarios, productos, pedidos, y subida de imágenes a **Cloudinary**.
Fue diseñado para integrarse con el frontend en React y manejar todas las operaciones lógicas y de base de datos del sistema.

---

## 📖 Descripción

Esta API RESTful proporciona los endpoints necesarios para el manejo de:
- 👥 **Usuarios:** registro, login y validación con token JWT.
- 🛍️ **Productos:** creación, actualización, eliminación y carga de imágenes.
- 🧾 **Pedidos:** registro y notificación por correo.
- 📦 **Integración con Cloudinary:** almacenamiento seguro de imágenes.
- 🔒 **Protección y validación:** middleware de seguridad, validación de inputs y cifrado de contraseñas.
El enfoque principal fue construir una arquitectura **segura, modular y escalable**, usando las mejores prácticas en Node.js y Express.

---

## ⚙️ Tecnologías utilizadas

| Área | Tecnologías |
|------|-------------|
| Servidor | Node.js, Express |
| Seguridad | bcrypt, JWT, helmet, cors, express-validator |
| Base de datos | MySQL, Sequelize |
| Subida de archivos | multer, streamifier, Cloudinary |
| Validación y esquema | Joi |
| Correo electrónico | Nodemailer |
| Utilidades | uuid, morgan, dotenv, axios |
| Comunicación en tiempo real | Socket.io |

---

## 🧩 Funcionalidades principales

- 🔐 **Autenticación segura** con JWT.
- 🧾 **Validación de datos** mediante Joi y express-validator.
- 📁 **Gestión de archivos** con multer y subida a Cloudinary.
- 📧 **Notificaciones por correo** al comprador y al administrador.
- 💾 **Persistencia de datos** con Sequelize y MySQL.
- 🧱 **Protecciones adicionales** con Helmet y CORS.
- 📡 **Soporte para sockets** (notificaciones en tiempo real).

---

## ✨ Notas
- Este backend fue diseñado para integrarse directamente con el **frontend del proyecto E-Commerce en React**.
- Sigue principios de **Clean Architecture**, con separación de controladores, rutas, servicios y modelos.
- Incluye **middleware de validación, control de errores global y sistema de logs** con Morgan.
- Para explorar más a fondo el front-end, puede visitar su [repositorio](https://github.com/maaquin/ecomerce-frontend.git).
- Enlace al proyecto desplegado: [e-commerce](https://ecomerce-frontend-azure.vercel.app)
- Para explorar más el panel administrativo, puede contactarme, ya que por temas de seguridad es una aplicación de escritorio local desarrollada con Electron.

---

## 📌 Autor
- Luciano Maquin – [@Maaquin](https://github.com/maaquin)
