// src/CraftingSystem.tsx
import React, { useState } from 'react';
import { Item, Recipe } from './types';
import Inventory from './Inventory';
import ItemSelector from './ItemSelector';

const recipes: Recipe[] = [
  { item1Id: 1, item2Id: 2, result: { id: 3, name: 'Sword', description: 'A basic sword' } },
  { item1Id: 1, item2Id: 3, result: { id: 4, name: 'Shield', description: 'A basic shield' } }
];

const items: Item[] = [
  { id: 1, name: 'Iron', description: 'A piece of iron' },
  { id: 2, name: 'Wood', description: 'A piece of wood' },
  { id: 3, name: 'Sword', description: 'A basic sword' }
];



const CraftingSystem: React.FC = () => {
  const [selectedItem1, setSelectedItem1] = useState<Item | null>(null);
  const [selectedItem2, setSelectedItem2] = useState<Item | null>(null);
  const [inventory, setInventory] = useState<Item[]>(items.sort((a, b) => a.name.localeCompare(b.name)));
  

  const handleCombine = () => {
    if (!selectedItem1 || !selectedItem2) return;

    const recipe = recipes.find(
      (r) =>
        (r.item1Id === selectedItem1.id && r.item2Id === selectedItem2.id) ||
        (r.item1Id === selectedItem2.id && r.item2Id === selectedItem1.id)
    );

    if (recipe) {
      setInventory((prevInventory) => [...prevInventory, recipe.result].sort((a, b) => a.name.localeCompare(b.name)));
      alert(`Crafted: ${recipe.result.name}`);
      setSelectedItem1(null);
      setSelectedItem2(null);
    } else {
      alert('No valid recipe found for these items!');
    }
  };

  return (
    <div className="CraftingSystem">
      <h1>Crafting System</h1>
      <div className="selector-container">
        <ItemSelector items={inventory} selectedItem={selectedItem1} onSelect={setSelectedItem1} label="Select Item 1" />
        <ItemSelector items={inventory} selectedItem={selectedItem2} onSelect={setSelectedItem2} label="Select Item 2" />
      </div>
      <button onClick={handleCombine}>Combine</button>
      <Inventory items={inventory} />
    </div>
  );
};

export default CraftingSystem;
