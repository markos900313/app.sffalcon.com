const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../public/images');

// Asegurar que el directorio existe
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function generateScreenshot(width, height, fileName) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fondo oscuro
  ctx.fillStyle = '#080F1E';
  ctx.fillRect(0, 0, width, height);

  // Texto
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.floor(width * 0.05)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SF Gestor Empresarial', width / 2, height / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(targetDir, fileName), buffer);
  console.log(`Generado: ${fileName} (${width}x${height})`);
}

// Generar mobile y desktop
generateScreenshot(390, 844, 'screenshot-mobile.png');
generateScreenshot(1280, 800, 'screenshot-desktop.png');
