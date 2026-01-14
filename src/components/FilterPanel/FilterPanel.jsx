import React from "react";
import styles from "./FilterPanel.module.css";

function FilterPanel({
  categories,
  materials,
  selectedCategories,
  selectedMaterials,
  minRating,
  onCategoryChange,
  onMaterialChange,
  onRatingChange,
  onClearAll,
  popularClasses,
}) {
  const ratingOptions = [4.5, 4.0, 3.5, 3.0, 0];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Фильтры</h3>
        <button onClick={onClearAll} className={styles.clearAllButton}>
          Сбросить все
        </button>
      </div>

      {/* Фильтр по категориям */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Категории</h4>
        <div className={styles.checkboxList}>
          {categories.map((category) => (
            <label key={category} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => onCategoryChange(category)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{category}</span>
              <span className={styles.count}>
                (
                {
                  popularClasses.filter((item) => item.category === category)
                    .length
                }
                )
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Фильтр по материалам */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Материалы и техники</h4>
        <div className={styles.checkboxList}>
          {materials.map((material) => (
            <label key={material} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedMaterials.includes(material)}
                onChange={() => onMaterialChange(material)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{material}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Фильтр по рейтингу */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Рейтинг</h4>
        <div className={styles.ratingFilter}>
          {ratingOptions.map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(rating)}
              className={`${styles.ratingButton} ${
                minRating === rating ? styles.active : ""
              }`}
            >
              {rating === 0 ? "Все" : `★ ${rating}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Активные фильтры */}
      {(selectedCategories.length > 0 || selectedMaterials.length > 0) && (
        <div className={styles.activeFilters}>
          <h4 className={styles.sectionTitle}>Активные фильтры</h4>
          <div className={styles.activeTags}>
            {selectedCategories.map((cat) => (
              <span key={cat} className={styles.activeTag}>
                {cat}
                <button
                  onClick={() => onCategoryChange(cat)}
                  className={styles.removeTag}
                >
                  ×
                </button>
              </span>
            ))}
            {selectedMaterials.map((mat) => (
              <span key={mat} className={styles.activeTag}>
                {mat}
                <button
                  onClick={() => onMaterialChange(mat)}
                  className={styles.removeTag}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
