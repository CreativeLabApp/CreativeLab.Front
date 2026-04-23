import { useState, useMemo, useEffect } from "react";
import styles from "./HomeContent.module.css";
import SearchBar from "../SearchBar/SearchBar";
import PopularMasterClasses from "../PopularMasterClasses/PopularMasterClasses";
import FilterPanel from "../FilterPanel/FilterPanel";
import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import { masterclassApi } from "../../api/masterclassApi";

function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [masterClasses, setMasterClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    masterclassApi
      .getAll()
      .then((data) => {
        const mapped = data.masterclasses.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.shortDescription || m.description || "",
          category: m.categoryName || m.categoryId,
          author: m.authorName || m.authorId,
          images: m.imageUrls?.length
            ? m.imageUrls
            : m.thumbnailUrl
              ? [m.thumbnailUrl]
              : [],
          rating: Number(m.rating) || 0,
          views: m.views || 0,
          materials: m.materials || [],
        }));
        setMasterClasses(mapped);
        setIsLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message);
        setIsLoading(false);
      });
  }, []);

  const allCategories = useMemo(() => {
    return [...new Set(masterClasses.map((item) => item.category))];
  }, [masterClasses]);

  const allMaterials = useMemo(() => {
    const materials = new Set();
    masterClasses.forEach((item) => {
      if (item.materials && Array.isArray(item.materials)) {
        item.materials.forEach((m) => materials.add(m));
      }
    });
    return Array.from(materials);
  }, [masterClasses]);

  const filteredClasses = useMemo(() => {
    return masterClasses.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category);

      const matchesMaterial =
        selectedMaterials.length === 0 ||
        (item.materials &&
          selectedMaterials.some((m) => item.materials.includes(m)));

      const matchesRating = item.rating >= minRating;

      return (
        matchesSearch && matchesCategory && matchesMaterial && matchesRating
      );
    });
  }, [
    masterClasses,
    searchQuery,
    selectedCategories,
    selectedMaterials,
    minRating,
  ]);

  const popularClasses = useMemo(() => {
    const hasFilters =
      searchQuery ||
      selectedCategories.length > 0 ||
      selectedMaterials.length > 0 ||
      minRating > 0;
    if (hasFilters) return filteredClasses;
    return [...masterClasses].sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [
    filteredClasses,
    masterClasses,
    searchQuery,
    selectedCategories,
    selectedMaterials,
    minRating,
  ]);

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    selectedMaterials.length > 0 ||
    minRating > 0;

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
            onCategoryChange={(cat) =>
              setSelectedCategories((prev) =>
                prev.includes(cat)
                  ? prev.filter((c) => c !== cat)
                  : [...prev, cat],
              )
            }
            onMaterialChange={(mat) =>
              setSelectedMaterials((prev) =>
                prev.includes(mat)
                  ? prev.filter((m) => m !== mat)
                  : [...prev, mat],
              )
            }
            onRatingChange={setMinRating}
            onClearAll={clearAllFilters}
            popularClasses={masterClasses}
          />
        </aside>

        <main className={styles.main}>
          {isLoading ? (
            <div className={styles.resultsInfo}>Загрузка мастер-классов...</div>
          ) : fetchError ? (
            <div className={styles.resultsInfo}>
              Ошибка загрузки: {fetchError}
            </div>
          ) : (
            <>
              <div className={styles.resultsInfo}>
                <div className={styles.resultsCount}>
                  Найдено мастер-классов:{" "}
                  <strong>{filteredClasses.length}</strong>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className={styles.clearButton}
                  >
                    ✕ Сбросить все фильтры
                  </button>
                )}
              </div>
              <PopularMasterClasses
                masterClasses={
                  hasActiveFilters ? filteredClasses : popularClasses
                }
                searchQuery={searchQuery}
                selectedCategories={selectedCategories}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomeContent;
