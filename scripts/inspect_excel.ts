
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const files = [
    '/Users/gurkantaskiran/Yandex.Disk.localized/Code/Budget App/Sample/gider listesi.xlsx',
    '/Users/gurkantaskiran/Yandex.Disk.localized/Code/Budget App/Sample/satis-faturalari.xlsx'
];

files.forEach(file => {
    console.log(`\n--- Inspecting: ${file} ---`);
    try {
        const buf = fs.readFileSync(file);
        const wb = XLSX.read(buf, { type: 'buffer' });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        // Get headers (first row) and some data
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length > 0) {
            console.log('Headers:', jsonData[0]);
            console.log('Sample Row 1:', jsonData[1]);
            console.log('Sample Row 2:', jsonData[2]);
        } else {
            console.log('Empty sheet');
        }
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
});
