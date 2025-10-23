import React from "react";
import styles from "./MasterClassesList.module.css";
import MasterClassesCard from "../MasterClassesCard/MasterClassesCard";

function MasterClassesList({ masterClasses }) {
  return (
    <div className={styles.grid}>
      {masterClasses.map((item) => (
        <MasterClassesCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default MasterClassesList;
