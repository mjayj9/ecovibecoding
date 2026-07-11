export type UserMode = 'general' | 'scientist';
export type Tab = 'home' | 'map' | 'news' | 'my';

export interface PledgeStatus {
  rule1: boolean;
  rule2: boolean;
  rule3: boolean;
  rule4: boolean;
  name: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Report {
  id?: string;
  userId: string;
  userName: string;
  title: string;
  location: Location;
  description: string;
  createdAt: number;
  status: 'pending' | 'verified' | 'rejected';
}
