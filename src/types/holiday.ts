export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  description?: string;
  type: 'PUBLIC' | 'OPTIONAL';
  isActive: boolean;
  createdAt: string;
}
