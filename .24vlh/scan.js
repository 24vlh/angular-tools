// https://medium.com/stackfame/get-list-of-all-files-in-a-directory-in-node-js-befd31677ec5
const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, '../projects/angular-tools/src/lib');
const results = [];

function getDirContents(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  const pattern = new RegExp('^(?!.*(spec\\.ts$|\\/index\\.ts$)).*', 'gm');
  files.forEach((str) => {
    let filePath = path.join(directoryPath, str);
    if (fs.lstatSync(filePath).isFile()) {
      if (path.extname(filePath) === '.ts' && pattern.test(filePath)) {
        results.push(filePath);
        pattern.lastIndex = 0;
      }
    } else {
      getDirContents(filePath);
    }
  });
}

try {
  getDirContents(directoryPath);
  const fp = fs.createWriteStream(path.join(__dirname, '../projects/angular-tools/src/public-api.ts'), {
    flags: 'w'
  });
  results.forEach((str) => {
    str = str.replace(/\\/g, '/').split('/src/')[1].replace('.ts', '');
    fp.write("export * from './" + str + "';" + '\r\n');
  });
  fp.end();
} catch (e) {
  console.log(e.message);
}
