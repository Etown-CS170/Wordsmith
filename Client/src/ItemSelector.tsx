// src/ItemSelector.tsx
import React from 'react';
import { Item } from './types';

interface ItemSelectorProps {
  items: Item[];
  selectedItem: Item | null;
  onSelect: (item: Item) => void;
  label: string;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({ items, selectedItem, onSelect, label }) => {
  return (
    <div>
      <label>{label}</label>
      <select
        value={selectedItem?.name || ''}
        onChange={(e) => {
          const selected = items.find((item) => item.name === (e.target.value));
          if (selected) onSelect(selected);
        }}
      >
        <option value="">Select an item</option>
        {items.map((item) => (
          <option key={item.name} value={item.name}>
            {item.name + '-' + item.emoji}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ItemSelector;
