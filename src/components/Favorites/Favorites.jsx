import React from "react";
import { Link } from "react-router-dom";
import { useFavoritesStore } from "../../stores/favoritesStore";
import popularClasses from "../../sources/popularClasses";
import MasterClassesCard from "../MasterClassesCard/MasterClassesCard";
import styles from "./Favorites.module.css";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

function Favorites() {
  const { favorites, clearFavorites } = useFavoritesStore();

  // Получаем избранные мастер-классы
  const favoriteItems = popularClasses.filter((item) =>
    favorites.includes(item.id)
  );

  const favoritesCount = favorites.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <HeartIconSolid className={styles.titleIcon} />
            <h1 className={styles.title}>Избранное</h1>
          </div>
        </div>

        {favoritesCount > 0 && (
          <button onClick={clearFavorites} className={styles.clearButton}>
            Очистить все
          </button>
        )}
      </div>

      {favoriteItems.length > 0 ? (
        <>
          <div className={styles.grid}>
            {favoriteItems.map((item) => (
              <MasterClassesCard key={item.id} item={item} />
            ))}
          </div>

          {/* Пагинация или подсказка */}
          <div className={styles.footerHint}>
            <p>Понравились другие мастер-классы? Добавляйте их в избранное!</p>
            <Link to="/" className={styles.exploreLink}>
              Перейти к мастер-классам
            </Link>
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <HeartIcon className={styles.emptyHeartIcon} />
          </div>
          <h2 className={styles.emptyTitle}>Избранное пусто</h2>
          <p className={styles.emptyText}>
            Добавляйте мастер-классы в избранное, чтобы вернуться к ним позже.
            Это поможет вам не потерять понравившиеся курсы.
          </p>
          <div className={styles.emptyActions}>
            <Link to="/" className={styles.catalogButton}>
              Смотреть все мастер-классы
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Favorites;
