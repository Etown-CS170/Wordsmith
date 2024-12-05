import React from "react";
import Select from "react-select";
import { Item } from "./types";
import { StylesConfig } from "react-select";

// Define the type for your options
interface ItemOption {
  value: string;
  label: string;
}

//AI used to add React Select and make sure styles are applied and box size remains the same
interface ItemSelectorProps {
  items: Item[];
  selectedItem: Item | null;
  onSelect: (item: Item | null) => void;
  label: string;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  items,
  selectedItem,
  onSelect,
  label,
}) => {
  // Map items to react-select options
  const options = items.map((item) => ({
    value: item.name,
    label: `${item.emoji} ${item.name}`,
  }));

  // Find the currently selected option
  const selectedOption = selectedItem
    ? {
        value: selectedItem.name,
        label: `${selectedItem.emoji} ${selectedItem.name}`,
      }
    : null;

  // Done with AI due to weird bugs with react-select
  // Custom styles for react-select
  const customStyles: StylesConfig<ItemOption, false> = {
    control: (provided) => ({
      ...provided,
      width: "100%", // Percent width
      minHeight: 40, // Consistent height
      borderRadius: "8px", // Optional: Add rounded corners for better aesthetics
    }),
    menu: (provided) => ({
      ...provided,
      width: "100%", // Match dropdown width to control
      padding: "5px", // Add padding inside the dropdown menu
      borderRadius: "8px", // Optional: Add rounded corners
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: 40, // Consistent height
    }),
    singleValue: (provided) => ({
      ...provided,
      overflow: "hidden", // Prevent text overflow
      textOverflow: "ellipsis", // Add ellipsis for long text
      whiteSpace: "nowrap",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "5px", // Add padding around the dropdown indicator
    }),
  };

  return (
    <div className="item-selector">
      <h3>{label}</h3>
      <Select
        options={options}
        value={selectedOption}
        onChange={(option) =>
          onSelect(
            option
              ? items.find((item) => item.name === option.value) || null
              : null,
          )
        }
        isClearable
        placeholder="Search for an item..."
        styles={customStyles} // Apply custom styles
      />
    </div>
  );
};

export default ItemSelector;
