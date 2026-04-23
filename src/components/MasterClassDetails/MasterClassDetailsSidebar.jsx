import React from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import styles from "./MasterClassDetailsSidebar.module.css";

function MasterClassDetailsSidebar({ masterClass, relatedClasses, navigate }) {
  return (
    <div className={styles.sidebarCard}>
      <h3 className={styles.sidebarTitle}>Информация</h3>

      {/* Материалы */}
      <div className={styles.tagsSection}>
        <h4 className={styles.tagsTitle}>Материалы</h4>
        <div className={styles.tagsList}>
          {masterClass.materials && masterClass.materials.length > 0 ? (
            masterClass.materials.map((material, index) => (
              <span key={index} className={styles.tag}>
                {material}
              </span>
            ))
          ) : (
            <p className={styles.noRelatedText}>Материалы не указаны</p>
          )}
        </div>
      </div>

      {/* Похожие мастер-классы */}
      <div className={styles.relatedSection}>
        <h4 className={styles.relatedTitle}>Похожие мастер-классы</h4>
        {relatedClasses.length > 0 ? (
          <div className={styles.relatedList}>
            {relatedClasses.map((item) => (
              <div
                key={item.id}
                className={styles.relatedItem}
                onClick={() => navigate(`/master-class/${item.id}`)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    navigate(`/master-class/${item.id}`);
                  }
                }}
              >
                <div className={styles.relatedImage}>
                  {item.image ? (
                    <img src={item.image} alt={item.title} loading="lazy" />
                  ) : (
                    <PhotoIcon className={styles.relatedPlaceholderIcon} />
                  )}
                </div>
                <div className={styles.relatedInfo}>
                  <h5 className={styles.relatedItemTitle}>{item.title}</h5>
                  <div className={styles.relatedMeta}>
                    <span className={styles.relatedAuthor}>{item.author}</span>
                    <span className={styles.relatedRating}>
                      ★ {item.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noRelatedText}>Нет похожих мастер-классов</p>
        )}
      </div>
    </div>
  );
}

export default MasterClassDetailsSidebar;
