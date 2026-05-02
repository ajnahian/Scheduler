export const STAFF_TITLES = [
  'Tech Experience Manager',
  'Tech Asst. Experience Manager',
  'Tech Merchandising Manager',
  'Tech Advisor',
  'Tech Specialist',
  'Tech Service Technician',
] as const;

export const ROLE_COLORS: Record<string, string> = {
  'Tech Experience Manager':       '#007AFF', // Apple Blue
  'Tech Asst. Experience Manager': '#5856D6', // Apple Indigo
  'Tech Merchandising Manager':    '#AF52DE', // Apple Purple
  'Tech Advisor':                  '#30B0C7', // Apple Teal
  'Tech Specialist':               '#34C759', // Apple Green
  'Tech Service Technician':       '#FF9500', // Apple Orange
};

export function getRoleColor(role: string): string {
  return ROLE_COLORS[role] ?? '#8E8E93';
}
