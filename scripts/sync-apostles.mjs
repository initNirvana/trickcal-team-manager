import fs from 'fs';
import path from 'path';

const JSON_FILE = 'src/data/apostles.json';
const CSV_FILE = 'src/data/apostles.csv';

const HEADERS = [
  'id', 'name', 'engName', 'isEldain', 'mercenary', 'rank', 'race', 'persona', 'method', 
  'position', 'positionPriority', 'role.main', 'role.subRole', 'role.trait', 
  'aside.hasAside', 'aside.importance', 'aside.score', 'aside.reason', 
  'baseScore', 'scoreBySize.size6', 'scoreBySize.size9', 
  'positionScore.front', 'positionScore.mid', 'positionScore.back', 
  'pvp.score', 'pvp.aside', 'pvp.reason', 'reason', 'role.subRole', 'role.trait'
];

function getValue(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return '';
    current = current[part];
  }
  if (Array.isArray(current)) return current.join(',');
  if (current === null || current === undefined) return '';
  return current;
}

function setValue(obj, path, value) {
  if (value === '' || value === undefined || value === null) return;
  
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  
  const lastPart = parts[parts.length - 1];
  
  // Type conversion
  let convertedValue = value;
  if (value === 'true') convertedValue = true;
  else if (value === 'false') convertedValue = false;
  else if (!isNaN(value) && value !== '') convertedValue = Number(value);
  
  // Special cases for arrays
  if (path === 'role.trait' || path === 'position' || path === 'positionPriority') {
    if (typeof value === 'string') {
      convertedValue = value.split(',').map(s => s.trim()).filter(s => s !== '');
    }
  }

  current[lastPart] = convertedValue;
}

function exportToCsv() {
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  const apostles = data.apostles;
  
  const csvRows = [];
  csvRows.push(HEADERS.join(','));
  
  for (const apostle of apostles) {
    const row = HEADERS.map(header => {
      let val = getValue(apostle, header);
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvRows.push(row.join(','));
  }
  
  fs.writeFileSync(CSV_FILE, csvRows.join('\n'), 'utf8');
  console.log(`Exported to ${CSV_FILE}`);
}

function importFromCsv() {
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`${CSV_FILE} not found`);
    return;
  }
  
  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const apostles = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const apostle = {};
    
    headers.forEach((header, index) => {
      if (row[index] !== undefined) {
        setValue(apostle, header, row[index]);
      }
    });
    
    apostles.push(apostle);
  }
  
  fs.writeFileSync(JSON_FILE, JSON.stringify({ apostles }, null, 2), 'utf8');
  console.log(`Imported to ${JSON_FILE}`);
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(s => {
    let cleaned = s.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    return cleaned.replace(/""/g, '"').trim();
  });
}

const mode = process.argv[2];
if (mode === 'export') {
  exportToCsv();
} else if (mode === 'import') {
  importFromCsv();
} else {
  console.log('Usage: node scripts/sync-apostles.mjs [export|import]');
}