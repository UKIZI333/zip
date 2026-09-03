export interface BookingCodeData {
  code_1?: string | null;
  code_2?: string | null;
  code_3?: string | null;
  code_4?: string | null;
  pop_code?: string | null;
  active_req?: string | null;
}

export function getCodeLabel(codeNum: number): string {
  switch (codeNum) {
    case 1:
      return "AuthApp";
    case 2:
      return "WhatsApp";
    case 3:
      return "SMS";
    case 4:
      return "Email";
    default:
      return `Code ${codeNum}`;
  }
}

export function parseBookingCodeData(raw: string | null | undefined): BookingCodeData {
  if (!raw) return {};
  const trimmed = raw.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed);
    } catch {}
  }

  // Fallback parsers for legacy formatted strings
  const data: BookingCodeData = {};

  if (trimmed.startsWith("POP_CODE:")) {
    data.pop_code = trimmed.replace("POP_CODE:", "");
    data.active_req = trimmed;
    return data;
  }

  if (trimmed.startsWith("CODE_") && (trimmed.includes("_REQUESTED") || trimmed.includes("_REJECTED"))) {
    data.active_req = trimmed;
    return data;
  }

  if (trimmed.startsWith("[Code ")) {
    const match = trimmed.match(/\[Code (\d)\]\s*(.*)/);
    if (match) {
      const num = match[1];
      const val = match[2];
      if (num === "1") data.code_1 = val;
      if (num === "2") data.code_2 = val;
      if (num === "3") data.code_3 = val;
      if (num === "4") data.code_4 = val;
    }
  }

  return data;
}

export function serializeBookingCodeData(data: BookingCodeData): string {
  return JSON.stringify(data);
}
