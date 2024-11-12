// src/types.ts
export interface Item {
    id: number;
    name: string;
    description: string;
  }
  
  export interface Recipe {
    item1Id: number;
    item2Id: number;
    result: Item;
  }
  