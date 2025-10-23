import React from "react";
import styles from "./PopularMasterClasses.module.css";
import { popularClasses } from "../../sources/popularClasses";
import MasterClassesList from "../MasterClassesList/MasterClassesList";

function PopularMasterClasses() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Популярные мастер-классы</h2>
      <MasterClassesList masterClasses={popularClasses} />
    </section>
  );
}

export default PopularMasterClasses;
