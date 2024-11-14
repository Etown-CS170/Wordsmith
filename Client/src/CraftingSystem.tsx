// src/CraftingSystem.tsx
import React, { useState } from "react";
import { Item, CombineResponse } from "./types";
import Inventory from "./Inventory";
import ItemSelector from "./ItemSelector";
import axios from "axios";

const items: Item[] = [
  { name: "Fire", emoji: "💧" },
  { name: "Water", emoji: "🔥" },
  { name: "Earth", emoji: "🌎" },
  { name: "Wind", emoji: "💨" },
];

const CraftingSystem: React.FC = () => {
  const [selectedItem1, setSelectedItem1] = useState<Item | null>(null);
  const [selectedItem2, setSelectedItem2] = useState<Item | null>(null);
  const [AIResponse, setAIResponse] = useState<CombineResponse>({
    new_element: "",
    emoji: "",
  });
  const [inventory, setInventory] = useState<Item[]>(
    items.sort((a, b) => a.name.localeCompare(b.name))
  );

  const handleCombine = async () => {
    if (!selectedItem1 || !selectedItem2) return;

    const response = await getCombinedItemDescription(
      selectedItem1.name,
      selectedItem2.name
    );
    setAIResponse(response);

    setInventory((prevInventory) => {
      const newInventory = [...prevInventory];
      newInventory.push({
        name: response.new_element,
        emoji: response.emoji,
      });
      return newInventory.sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  // Axios instance to set base URL
  const apiClient = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const getCombinedItemDescription = async (
    item1: string,
    item2: string
  ): Promise<CombineResponse> => {
    try {
      const response = await apiClient.post<CombineResponse>("/combine", {
        item1,
        item2,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to combine elements"
        );
      } else {
        throw new Error("Network error");
      }
    }
  };

  return (
    <div className="CraftingSystem">
      <h1>Crafting System</h1>
      <div className="selector-container">
        <ItemSelector
          items={inventory}
          selectedItem={selectedItem1}
          onSelect={setSelectedItem1}
          label="Select Item 1"
        />
        <ItemSelector
          items={inventory}
          selectedItem={selectedItem2}
          onSelect={setSelectedItem2}
          label="Select Item 2"
        />
      </div>
      <button onClick={handleCombine}>Combine</button>
      <div className="center">
        <h2>Latest Result</h2>
        <h2>{AIResponse.emoji + AIResponse.new_element}</h2>
      </div>

      <Inventory items={inventory} />
    </div>
  );
};

export default CraftingSystem;
