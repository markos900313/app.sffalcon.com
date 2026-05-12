const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo azul redondeado
  const radius = size * 0.2;
  ctx.fillStyle = '#1B4FD8';
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.arcTo(size, 0, size, radius, radius);
  ctx.lineTo(size, size - radius);
  ctx.arcTo(size, size, size - radius, size, radius);
  ctx.lineTo(radius, size);
  ctx.arcTo(0, size, 0, size - radius, radius);
  ctx.lineTo(0, radius);
  ctx.arcTo(0, 0, radius, 0, radius);
  ctx.closePath();
  ctx.fill();
  
  // Texto SF centrado
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SF', size / 2, size / 2);
  
  // Asegurar que la carpeta public existe
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)){
      fs.mkdirSync(publicDir);
  }

  // Guardar como PNG
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(publicDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Creado icon-${size}.png en ${filePath}`);
}

try {
    generateIcon(192);
    generateIcon(512);
} catch (error) {
    console.error('Error generando iconos:', error.message);
    console.log('Asegúrate de tener instalado canvas: npm install canvas');
}
