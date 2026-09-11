export function exportToCsv(rows: Record<string, any>[], headers?: string[]): string {
  if (!rows || rows.length === 0) {
    return headers ? headers.join(',') + '\n' : '';
  }

  const keys = headers || Object.keys(rows[0]);
  const headerLine = keys.map((k) => `"${k}"`).join(',');

  const lines = rows.map((row) =>
    keys
      .map((key) => {
        const val = row[key];
        if (val === null || val === undefined) return '""';
        const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        // Escape quotes
        return `"${strVal.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  return [headerLine, ...lines].join('\n');
}
