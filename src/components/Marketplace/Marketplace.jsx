import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../../api/productApi";
import ProductCard from "../ProductCard/ProductCard";
import SearchBar from "../SearchBar/SearchBar";
import MarketplaceFilter from "../MarketplaceFilter/MarketplaceFilter";
import styles from "./Marketplace.module.css";
import { TagIcon, PlusIcon } from "@heroicons/react/24/outline";

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    setIsLoading(true);
    productApi
      .getAll(false)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Получаем уникальные категории
  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category))];
  }, [products]);

  // Фильтрация товаров
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (selectedCategory) {
      result = result.filter(
        (product) => product.category === selectedCategory,
      );
    }

    result = result.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1],
    );

    if (selectedStatus === "available") {
      result = result.filter((p) => p.isAvailable);
    } else if (selectedStatus === "unavailable") {
      result = result.filter((p) => !p.isAvailable);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "new":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "rating":
          return b.rating - a.rating;
        case "popular":
        default:
          return (b.views || 0) - (a.views || 0);
      }
    });

    return result;
  }, [
    products,
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,
    selectedStatus,
  ]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange([0, 500]);
    setSortBy("popular");
    setSelectedStatus("");
  };

  const handlePriceChange = (min, max) => {
    setPriceRange([min, max]);
  };

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Магазин</h1>
          </div>
        </div>

        {/* Поиск */}
        <div className={styles.searchSection}>
          <SearchBar
            placeholder="Поиск товаров по названию, описанию или тегам"
            onSearch={setSearchQuery}
            value={searchQuery}
          />

          <Link
            to="/marketplace/add-product"
            className={styles.addProductButton}
          >
            <PlusIcon className={styles.plusIcon} />
            Продавать товары
          </Link>
        </div>
      </div>

      <div className={styles.content}>
        {/* Панель фильтров */}
        <MarketplaceFilter
          categories={categories}
          selectedCategory={selectedCategory}
          priceRange={priceRange}
          selectedStatus={selectedStatus}
          onCategoryChange={setSelectedCategory}
          onPriceChange={handlePriceChange}
          onStatusChange={setSelectedStatus}
          onClear={handleClearFilters}
        />

        {/* Основной контент */}
        <main className={styles.main}>
          {/* Сортировка и управление видом */}
          <div className={styles.controls}>
            <div className={styles.resultsInfo}>
              <span className={styles.resultsCount}>
                Найдено товаров: <strong>{filteredProducts.length}</strong>
              </span>

              {(searchQuery ||
                selectedCategory ||
                selectedStatus ||
                priceRange[0] > 0 ||
                priceRange[1] < 500) && (
                <button
                  onClick={handleClearFilters}
                  className={styles.clearButton}
                >
                  ✕ Сбросить фильтры
                </button>
              )}
            </div>

            <div className={styles.sortControls}>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewButton} ${
                    viewMode === "grid" ? styles.active : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Сетка"
                >
                  ▦
                </button>
                <button
                  className={`${styles.viewButton} ${
                    viewMode === "list" ? styles.active : ""
                  }`}
                  onClick={() => setViewMode("list")}
                  aria-label="Список"
                >
                  ≡
                </button>
              </div>
            </div>
          </div>

          {/* Основная сетка товаров */}
          <section className={styles.productsSection}>
            {(searchQuery || selectedCategory) && (
              <div className={styles.sectionHeader}>
                <TagIcon className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>
                  {selectedCategory
                    ? `Категория: ${selectedCategory}`
                    : searchQuery
                      ? `Результаты поиска: "${searchQuery}"`
                      : "Все товары"}
                </h2>
              </div>
            )}

            {isLoading ? (
              <div className={styles.noResults}>Загрузка товаров...</div>
            ) : filteredProducts.length > 0 ? (
              <div
                className={`${styles.productsGrid} ${
                  viewMode === "list" ? styles.listView : ""
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🔍</div>
                <h3 className={styles.noResultsTitle}>Товары не найдены</h3>
                <p className={styles.noResultsText}>
                  Попробуйте изменить параметры поиска или выберите другие
                  фильтры
                </p>
                <button
                  onClick={handleClearFilters}
                  className={styles.clearResultsButton}
                >
                  Показать все товары
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Marketplace;
