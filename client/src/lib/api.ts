const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const API_BASE_URL = base.startsWith('http') ? base : `https://${base}`;

