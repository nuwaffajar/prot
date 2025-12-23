// Automatic letter numbering system - akan digenerate di backend

// Convert month number to Roman numerals
export function toRoman(month: number): string {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[month - 1] || 'I';
}

// Parse nomor surat to get components (untuk display saja)
export function parseNomorSurat(nomorSurat: string): {
  nomor: number;
  kodeSurat: string;
  kodePerusahaan: string;
  bulan: string;
  tahun: number;
} | null {
  const parts = nomorSurat.split('/');
  if (parts.length !== 5) return null;
  
  return {
    nomor: parseInt(parts[0]),
    kodeSurat: parts[1],
    kodePerusahaan: parts[2],
    bulan: parts[3],
    tahun: parseInt(parts[4])
  };
}

// Format tanggal untuk display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Format tanggal singkat
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Format tanggal untuk input date
export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}