import React from "react";
import styles from "./PopularMasterClasses.module.css";
import MasterClassesList from "../MasterClassesList/MasterClassesList";

function PopularMasterClasses({ masterClasses }) {
  return (
    <section className={styles.section}>
      {masterClasses.length === 0 ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <h3 className={styles.noResultsTitle}>Ничего не найдено</h3>
          <p className={styles.noResultsText}>
            Попробуйте изменить параметры поиска или выбрать другие фильтры
          </p>
        </div>
      ) : (
        <MasterClassesList masterClasses={masterClasses} />
      )}
    </section>
  );
}

export default PopularMasterClasses;
