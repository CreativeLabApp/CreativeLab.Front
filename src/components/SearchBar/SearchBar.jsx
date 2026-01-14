import React, { useState } from "react";
import { ReactComponent as MagnifierIcon } from "../../assets/magnifier.svg";
import { XMarkIcon } from "@heroicons/react/24/solid";
import styles from "./SearchBar.module.css";

function SearchBar({ placeholder, onSearch, value = "" }) {
  const [query, setQuery] = useState(value);

  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (onSearch) {
      onSearch(newQuery);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputWrapper}>
        <MagnifierIcon className={styles.searchIcon} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className={styles.input}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
          >
            <XMarkIcon className={styles.clearIcon} />
          </button>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
