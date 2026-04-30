import React from "react";
import styles from "./MarketplaceFilter.module.css";

function MarketplaceFilter({
  categories,
  selectedCategory,
  priceRange,
  selectedStatus,
  onCategoryChange,
  onPriceChange,
  onStatusChange,
  onClear,
}) {
  const maxPrice = 500;
  const priceLabels = {
    0: "0 Br",
    125: "125",
    250: "250",
    375: "375",
    500: "500+",
  };

  const handlePriceInput = (type, value) => {
    const numValue = parseInt(value) || 0;
    if (type === "min") {
      onPriceChange(numValue, priceRange[1]);
    } else {
      onPriceChange(priceRange[0], numValue);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Фильтры</h3>
        <button onClick={onClear} className={styles.clearAllButton}>
          Сбросить все
        </button>
      </div>

      {/* Фильтр по категориям */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Категории</h4>
        <div className={styles.categoryList}>
          <button
            onClick={() => onCategoryChange("")}
            className={`${styles.categoryButton} ${
              selectedCategory === "" ? styles.active : ""
            }`}
          >
            Все категории
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`${styles.categoryButton} ${
                selectedCategory === category ? styles.active : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Фильтр по цене */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Цена</h4>
        <div className={styles.rangeSlider}>
          <div className={styles.rangeInputs}>
            <div className={styles.rangeInputGroup}>
              <label htmlFor="minPrice" className={styles.rangeLabel}>
                От
              </label>
              <input
                id="minPrice"
                type="number"
                min="0"
                max={maxPrice}
                value={priceRange[0]}
                onChange={(e) => handlePriceInput("min", e.target.value)}
                className={styles.rangeInput}
              />
            </div>
            <div className={styles.rangeInputGroup}>
              <label htmlFor="maxPrice" className={styles.rangeLabel}>
                До
              </label>
              <input
                id="maxPrice"
                type="number"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => handlePriceInput("max", e.target.value)}
                className={styles.rangeInput}
              />
            </div>
          </div>

          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="0"
              max={maxPrice}
              step="5"
              value={priceRange[0]}
              onChange={(e) => handlePriceInput("min", e.target.value)}
              className={styles.slider}
            />
            <input
              type="range"
              min="0"
              max={maxPrice}
              step="5"
              value={priceRange[1]}
              onChange={(e) => handlePriceInput("max", e.target.value)}
              className={styles.slider}
            />
          </div>

          <div className={styles.rangeLabels}>
            {Object.entries(priceLabels).map(([value, label]) => (
              <span key={value} className={styles.rangeLabelText}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Статус товара */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Статус товара</h4>
        <div className={styles.statusFilters}>
          <button
            onClick={() =>
              onStatusChange(selectedStatus === "available" ? "" : "available")
            }
            className={`${styles.statusButton} ${selectedStatus === "available" ? styles.active : ""}`}
          >
            <span className={`${styles.statusDot} ${styles.available}`}></span>В
            наличии
          </button>
          <button
            onClick={() =>
              onStatusChange(
                selectedStatus === "unavailable" ? "" : "unavailable",
              )
            }
            className={`${styles.statusButton} ${selectedStatus === "unavailable" ? styles.active : ""}`}
          >
            <span className={`${styles.statusDot} ${styles.reserved}`}></span>
            Нет в наличии
          </button>
        </div>
      </div>
    </div>
  );
}

export default MarketplaceFilter;
