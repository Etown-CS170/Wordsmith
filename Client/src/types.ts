// src/types.ts
export interface Item {
  name: string;
  emoji: string;
}
export interface CombineResponse {
  new_element: string;
  emoji: string;
  first_discovered: boolean;
}
