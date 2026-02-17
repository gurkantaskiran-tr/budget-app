const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

function parseCSV(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQuotes = !inQuotes; continue; }
        if (line[i] === ',' && !inQuotes) { result.push(current); current = ''; continue; }
        current += line[i];
    }
    result.push(current);
    return result;
}

const headerArr = parseCSV(lines[0]);
console.log('=== COLUMNS ===');
headerArr.forEach((h, i) => console.log(`  ${i}: ${h}`));

const data = lines.slice(1).map(l => parseCSV(l));
console.log(`\nTotal rows: ${data.length}`);

const uniqVals = (idx) => [...new Set(data.map(r => (r[idx] || '').trim()).filter(Boolean))];

console.log('\n--- Unique Aşama (Stage) ---');
uniqVals(14).forEach(v => console.log(`  ${v}`));

console.log('\n--- Unique Kaynak (Source) ---');
uniqVals(7).forEach(v => console.log(`  ${v}`));

console.log('\n--- Unique Potansiyel Müşteri Türü ---');
uniqVals(10).forEach(v => console.log(`  ${v}`));

console.log('\n--- Unique Para Birimi ---');
uniqVals(6).forEach(v => console.log(`  ${v}`));

console.log('\n--- Unique Ürün Kategorisi ---');
uniqVals(4).forEach(v => console.log(`  ${v}`));

console.log('\n--- Unique Fırsat Firması ---');
uniqVals(3).forEach(v => console.log(`  ${v}`));

console.log('\n--- Unique Satış Temsilcisi ---');
uniqVals(1).forEach(v => console.log(`  ${v}`));

console.log('\n--- Sample data (first 3 rows) ---');
data.slice(0, 3).forEach((row, i) => {
    console.log(`\nRow ${i + 1}:`);
    headerArr.forEach((h, j) => {
        if (row[j] && row[j].trim()) console.log(`  ${h}: ${row[j].trim()}`);
    });
});
