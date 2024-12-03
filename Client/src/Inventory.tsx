import React from "react";
import { Item } from "./types";

interface InventoryProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onItemClick }) => {
  return (
    <div className="Inventory">
      <h2>Inventory</h2>
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            onClick={() => onItemClick(item)}
            style={{ cursor: "pointer" }}
          >
            <strong>{item.name}</strong> - {item.emoji}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventory;
