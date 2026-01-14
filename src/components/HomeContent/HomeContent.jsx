import React, { useState, useMemo } from "react";
import styles from "./HomeContent.module.css";
import SearchBar from "../SearchBar/SearchBar";
import PopularMasterClasses from "../PopularMasterClasses/PopularMasterClasses";
import FilterPanel from "../FilterPanel/FilterPanel";
import popularClasses from "../../sources/popularClasses";

function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [minRating, setMinRating] = useState(0);

  const allCategories = [
    ...new Set(popularClasses.map((item) => item.category)),
  ];
  const allMaterials = useMemo(() => {
    const materials = new Set();
    popularClasses.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => materials.add(tag));
      }
    });
    return Array.from(materials);
  }, []);

  const filteredClasses = useMemo(() => {
    return popularClasses.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags &&
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category);

      const matchesMaterial =
        selectedMaterials.length === 0 ||
        (item.tags &&
          selectedMaterials.some((material) => item.tags.includes(material)));

      const matchesRating = item.rating >= minRating;

      return (
        matchesSearch && matchesCategory && matchesMaterial && matchesRating
      );
    });
  }, [searchQuery, selectedCategories, selectedMaterials, minRating]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleMaterialChange = (material) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const handleRatingChange = (rating) => {
    setMinRating(rating);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setMinRating(0);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>Мастер-классы</div>
        <SearchBar
          placeholder="Поиск мастер-классов"
          onSearch={setSearchQuery}
          value={searchQuery}
        />
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <FilterPanel
            categories={allCategories}
            materials={allMaterials}
            selectedCategories={selectedCategories}
            selectedMaterials={selectedMaterials}
            minRating={minRating}
            onCategoryChange={handleCategoryChange}
            onMaterialChange={handleMaterialChange}
            onRatingChange={handleRatingChange}
            onClearAll={clearAllFilters}
            popularClasses={popularClasses}
          />
        </aside>

        {/* Основной контент */}
        <main className={styles.main}>
          <div className={styles.resultsInfo}>
            <div className={styles.resultsCount}>
              Найдено мастер-классов: <strong>{filteredClasses.length}</strong>
            </div>
            {searchQuery ||
              selectedCategories.length > 0 ||
              selectedMaterials.length > 0 ||
              (minRating > 0 && (
                <button
                  onClick={clearAllFilters}
                  className={styles.clearButton}
                >
                  ✕ Сбросить все фильтры
                </button>
              ))}
          </div>

          <PopularMasterClasses
            masterClasses={filteredClasses}
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
          />
        </main>
      </div>
    </div>
  );
}

export default HomeContent;
