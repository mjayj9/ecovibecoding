export type UserMode = 'general' | 'scientist';
export type Tab = 'home' | 'map' | 'news' | 'my';

export interface PledgeStatus {
  rule1: boolean;
  rule2: boolean;
  rule3: boolean;
  rule4: boolean;
  name: string;
}
