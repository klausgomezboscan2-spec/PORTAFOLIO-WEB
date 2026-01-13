// Script de ejemplo para optimizar imágenes con sharp
// Uso:
// 1) Instalar dependencias: npm install sharp
// 2) Ejecutar: node scripts/compress_images.js

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const folders = [
  'imagenes',
  'imagenes/articulos/ropa',
  'imagenes/articulos/manga',
  'imagenes/articulos/joyeria',
  'imagenes/articulos/figuras-de-accion'
];

async function processImage(filePath){
  const ext = path.extname(filePath).toLowerCase();
  // Save compressed images to a separate folder to avoid overwriting originals
  const relDir = path.relative(path.join(__dirname, '..'), filePath);
  const outBase = path.join(__dirname, '..', 'imagenes', 'compressed', relDir);
  const outDir = path.dirname(outBase);
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = outBase; // compressed output path
  try {
    if(ext === '.jpg' || ext === '.jpeg' || ext === '.png'){
      await sharp(filePath)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(outPath + '.tmp');
      fs.renameSync(outPath + '.tmp', outPath);
      console.log('Compressed copy:', outPath);
    } else {
      console.log('Omitido (tipo no soportado):', filePath);
    }
  } catch(err){
    console.error('Error procesando', filePath, err.message);
  }
}

(async ()=>{
  for(const folder of folders){
    const abs = path.join(__dirname, '..', folder);
    if(!fs.existsSync(abs)) continue;
    const items = fs.readdirSync(abs);
    for(const it of items){
      const full = path.join(abs, it);
      const stat = fs.statSync(full);
      if(stat.isFile()){
        await processImage(full);
      }
    }
  }
})();
