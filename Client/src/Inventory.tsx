// src/Inventory.tsx
import React from "react";
import { Item } from "./types";

interface InventoryProps {
  items: Item[];
}

const Inventory: React.FC<InventoryProps> = ({ items }) => {
  return (
    <div className="Inventory">
      <h2>Inventory</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <strong>{item.name}</strong> - {item.emoji}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventory;
