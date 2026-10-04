const fs = require('fs');
const path = require('path');

const sourceDirectory = path.resolve(__dirname, '..', '..', 'datasets');
const publicDirectory = path.resolve(__dirname, '..', 'public', 'datasets');
const files = ['groups.csv', 'knockout.csv'];

fs.mkdirSync(publicDirectory, { recursive: true });

files.forEach((file) => {
  const source = path.join(sourceDirectory, file);
  const destination = path.join(publicDirectory, file);
  if (!fs.existsSync(source)) {
    throw new Error(`Required tournament dataset is missing: ${source}`);
  }
  fs.copyFileSync(source, destination);
});

console.log(`Synced ${files.length} tournament datasets to client/public/datasets.`);
