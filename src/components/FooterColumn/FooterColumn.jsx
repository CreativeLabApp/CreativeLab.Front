import React from "react";
import styles from "./FooterColumn.module.css";
import { Link } from "react-router-dom";

export default function FooterColumn({ title, items }) {
  return (
    <div className={styles.column}>
      <h4>{title}</h4>

      {items.map((item, index) =>
        item.type === "link" ? (
          <Link key={index} to={item.href}>
            {item.label}
          </Link>
        ) : item.type === "external" ? (
          <a
            key={index}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.label}
          </a>
        ) : (
          <p key={index}>{item.label}</p>
        )
      )}
    </div>
  );
}
