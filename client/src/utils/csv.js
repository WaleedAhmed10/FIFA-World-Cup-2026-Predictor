export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (inQuotes) throw new Error('A tournament CSV contains an unterminated quoted field.');
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== '')) rows.push(row);
  }
  if (rows.length < 2) throw new Error('A tournament CSV must contain a header and at least one row.');

  const headers = rows[0].map((header) => header.trim().replace(/^\uFEFF/, ''));
  return rows.slice(1).map((values) => {
    if (values.length !== headers.length) {
      throw new Error(`A tournament CSV row has ${values.length} columns; expected ${headers.length}.`);
    }
    return headers.reduce((record, header, index) => {
      record[header] = values[index].trim();
      return record;
    }, {});
  });
};
