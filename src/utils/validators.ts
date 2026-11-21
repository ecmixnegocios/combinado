export function cleanDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Valida matematicamente um CPF brasileiro (11 dígitos + dígitos verificadores).
 */
export function validateCPF(cpf: string): boolean {
  const digits = cleanDigits(cpf);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number(digits[10])) return false;

  return true;
}

export function formatCPF(value: string): string {
  const d = cleanDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatWhatsApp(value: string): string {
  const d = cleanDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function buildWhatsAppUrl(
  rawPhone: string,
  providerName: string,
  clientName: string
): string {
  const digits = cleanDigits(rawPhone);
  const fullNumber = digits.startsWith("55") ? digits : `55${digits}`;
  const text = `Olá ${providerName}, vi seu perfil no Combinado. Meu nome é ${clientName} e gostaria de um orçamento.`;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(text)}`;
}

const CATEGORY_SINGULAR_MAP: Record<string, string> = {
  Pedreiros: "Pedreiro",
  Eletricistas: "Eletricista",
  Encanadores: "Encanador",
  "Diaristas / Faxineiras": "Diarista",
  "Técnico de Refrigeração": "Refrigeração",
  "Ajudante de Pedreiro": "Ajudante",
  "Limpeza de Quintal": "Limpeza de Quintal",
  "Faz Tudo": "Faz Tudo",
  Serralheria: "Serralheiro",
  Telhado: "Telhadista",
  Babá: "Babá",
  "Energia Solar / Placas": "Energia Solar",
};

export function getCategoryPrefix(categoryName?: string): string {
  if (!categoryName) return "";
  return CATEGORY_SINGULAR_MAP[categoryName] ?? categoryName;
}

/**
 * Formata o nome de exibição do profissional como "Profissão / Nome"
 * (ex: "Eletricista / Beto", "Babá / Tia Ana").
 */
export function formatProviderTitle(
  displayName: string,
  categoryName?: string
): string {
  const prefix = getCategoryPrefix(categoryName);
  const cleanName = displayName.trim();
  if (!prefix) return cleanName;
  if (cleanName.toLowerCase().startsWith(`${prefix.toLowerCase()} /`)) {
    return cleanName;
  }
  return `${prefix} / ${cleanName}`;
}
