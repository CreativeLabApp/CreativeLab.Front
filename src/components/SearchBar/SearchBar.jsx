import React, { useState } from "react";
import { ReactComponent as MagnifierIcon } from "../../assets/magnifier.svg";
import styles from "./SearchBar.module.css";

function SearchBar({ placeholder }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Поиск:", query);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        <MagnifierIcon className={styles.icon} />
      </button>
    </form>
  );
}

export default SearchBar;
