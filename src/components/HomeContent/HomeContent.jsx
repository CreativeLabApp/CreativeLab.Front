import React, { useState, useMemo } from "react";
import styles from "./HomeContent.module.css";
import SearchBar from "../SearchBar/SearchBar";
import PopularMasterClasses from "../PopularMasterClasses/PopularMasterClasses";
import FilterPanel from "../FilterPanel/FilterPanel";
import { useMasterClassesStore } from "../../stores/masterClassesStore";
import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";

function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [minRating, setMinRating] = useState(0);

  // Используем хранилище для получения данных
  const { masterClasses, searchMasterClasses } = useMasterClassesStore();

  // Получаем все уникальные категории из хранилища
  const allCategories = useMemo(() => {
    return [...new Set(masterClasses.map((item) => item.category))];
  }, [masterClasses]);

  // Получаем все уникальные материалы/теги из хранилища
  const allMaterials = useMemo(() => {
    const materials = new Set();
    masterClasses.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => materials.add(tag));
      }
    });
    return Array.from(materials);
  }, [masterClasses]);

  // Отфильтрованные мастер-классы с использованием мемоизации
  const filteredClasses = useMemo(() => {
    // Сначала применяем поиск по запросу
    let result = masterClasses;

    if (searchQuery) {
      result = searchMasterClasses(searchQuery);
    }

    // Затем применяем остальные фильтры
    return result.filter((item) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category);

      const matchesMaterial =
        selectedMaterials.length === 0 ||
        (item.tags &&
          selectedMaterials.some((material) => item.tags.includes(material)));

      const matchesRating = item.rating >= minRating;

      return matchesCategory && matchesMaterial && matchesRating;
    });
  }, [
    masterClasses,
    searchQuery,
    selectedCategories,
    selectedMaterials,
    minRating,
    searchMasterClasses,
  ]);

  // Получаем популярные мастер-классы для отображения (если нет фильтров)
  const popularClasses = useMemo(() => {
    if (
      searchQuery ||
      selectedCategories.length > 0 ||
      selectedMaterials.length > 0 ||
      minRating > 0
    ) {
      return filteredClasses;
    }
    // Если нет фильтров, показываем все мастер-классы, отсортированные по просмотрам
    return [...masterClasses].sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [
    filteredClasses,
    masterClasses,
    searchQuery,
    selectedCategories,
    selectedMaterials,
    minRating,
  ]);

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

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    selectedMaterials.length > 0 ||
    minRating > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>Мастер-классы</div>

        <div className={styles.searchSection}>
          <SearchBar
            placeholder="Поиск мастер-классов"
            onSearch={setSearchQuery}
            value={searchQuery}
          />
          <Link to="/create-masterclass" className={styles.addProductButton}>
            <PlusIcon className={styles.plusIcon} />
            Создать мастер-класс
          </Link>
        </div>
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
            popularClasses={masterClasses}
          />
        </aside>

        {/* Основной контент */}
        <main className={styles.main}>
          <div className={styles.resultsInfo}>
            <div className={styles.resultsCount}>
              Найдено мастер-классов: <strong>{filteredClasses.length}</strong>
            </div>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className={styles.clearButton}>
                ✕ Сбросить все фильтры
              </button>
            )}
          </div>

          <PopularMasterClasses
            masterClasses={hasActiveFilters ? filteredClasses : popularClasses}
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
          />
        </main>
      </div>
    </div>
  );
}

export default HomeContent;
