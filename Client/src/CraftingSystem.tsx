// src/CraftingSystem.tsx
import React, { useState, useEffect } from "react";
import { Item, CombineResponse } from "./types";
import Inventory from "./Inventory";
import ItemSelector from "./ItemSelector";
import axios from "axios";

//AI Used to help create Api calls
// Axios instance to set base URL
const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});
await apiClient
  .get("/loadDefault")
  .then((response) => console.log(response.data));

const list = await apiClient
  .get<Item[]>("/getCurrentList")
  .then((response) => response.data);

console.log(list);

const items: Item[] = [...list];

const CraftingSystem: React.FC = () => {
  const [selectedItem1, setSelectedItem1] = useState<Item | null>(null);
  const [selectedItem2, setSelectedItem2] = useState<Item | null>(null);
  const [isCombining, setIsCombining] = useState(false);
  const [AIResponse, setAIResponse] = useState<CombineResponse>({
    new_element: "",
    emoji: "",
  });
  const [targetWord, setTargetWord] = useState<string>("");

  useEffect(() => {
    const fetchTargetWord = async () => {
      try {
        const response = await apiClient.get("getNewTargetWord");
        setTargetWord(response.data.noun);
      } catch (error) {
        console.error("Error fetching target word:", error);
      }
    };

    fetchTargetWord();
  }, []);
  //AI used to make sure sorting doesnt break
  const [inventory, setInventory] = useState<Item[]>(
    items.sort((a, b) => (a.name || "").localeCompare(b.name || "")),
  );

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (inventory.some((item) => item.name === targetWord)) {
      setShowPopup(true);
    }
  }, [inventory, targetWord]);

  const handleClosePopup = async () => {
    await handleRefreshDatabase();
    await handleGetNewTargetWord();

    setShowPopup(false);
  };

  const handleCombine = async () => {
    if (!selectedItem1 || !selectedItem2) return;
    setAIResponse({ new_element: "", emoji: "" });
    setIsCombining(true); // Start animation

    try {
      const response = await getCombinedItemDescription(
        selectedItem1.name,
        selectedItem2.name,
      );
      setAIResponse(response);

      if (!inventory.find((item) => item.name === response.new_element)) {
        setInventory((prevInventory) => {
          const newInventory = [
            ...prevInventory,
            {
              name: response.new_element,
              emoji: response.emoji,
            },
          ];
          return newInventory.sort((a, b) =>
            (a.name || "").localeCompare(b.name || ""),
          );
        });
      }
    } catch (error) {
      console.error("Error combining items:", error);
    } finally {
      setIsCombining(false); // Stop animation
    }
  };

  const handleInventoryItemClick = (item: Item) => {
    if (!selectedItem1) {
      setSelectedItem1(item);
    } else {
      setSelectedItem2(item);
    }
  };

  const getCombinedItemDescription = async (
    item1: string,
    item2: string,
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
          error.response.data.message || "Failed to combine elements",
        );
      } else {
        throw new Error("Network error");
      }
    }
  };

  const handleRefreshDatabase = async () => {
    try {
      const response = await apiClient.post("/refreshDatabase");
      console.log("Database reset:", response.data);
      const updatedList = await apiClient
        .get<Item[]>("/getCurrentList")
        .then((res) => res.data);
      setInventory(
        updatedList.sort((a, b) => (a.name || "").localeCompare(b.name || "")),
      );
      setSelectedItem1(null);
      setSelectedItem2(null);
      setAIResponse({ new_element: "", emoji: "" });
    } catch (error) {
      console.error("Failed to refresh database:", error);
    }
  };

  const handleGetNewTargetWord = async () => {
    try {
      const response = await apiClient.get("/getNewTargetWord");
      console.log("New target word:", response.data);
      setTargetWord(response.data.noun);
    } catch (error) {
      console.error("Failed to get new target word:", error);
    }
  };

  // AI used for formatting and styling
  return (
    <div className="CraftingSystem">
      <h1>WordSmith</h1>
      <h2 className="target-word-container">
        <span className="target-word">
          Target Word:<br></br> {targetWord}
        </span>
        <button
          className="get-new-target-button"
          onClick={handleGetNewTargetWord}
        >
          Get New Target
        </button>
      </h2>

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

      <button onClick={handleCombine} disabled={isCombining}>
        {isCombining ? "Combining..." : "Combine"}
      </button>

      {isCombining && (
        <div className="loading-animation">
          <div className="spinner"></div>
          <p>Combining items...</p>
        </div>
      )}

      <div className="center">
        <h2>Latest Result</h2>
        <h2>{AIResponse.emoji + AIResponse.new_element}</h2>
      </div>
      <div className="center">
        <button onClick={handleRefreshDatabase}>Reset Database</button>
      </div>
      <Inventory items={inventory} onItemClick={handleInventoryItemClick} />
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Congratulations!</h2>
            <p>The target word "{targetWord}" has been found!</p>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CraftingSystem;
