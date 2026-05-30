import React from "react";
import PageWrapper from "../../components/common/PageWrapper/PageWrapper";
import styles from "./AboutPage.module.css";

function AboutPage() {
  return (
    <PageWrapper>
      <div className={styles.aboutContainer}>
        <h1 className={styles.title}>О проекте</h1>{" "}
        <p className={styles.subtitle}>
          CreativeLab — веб-приложения, позволяющего пользователю просматривать
          мастер-классы, создавать свои и выставлять объявления о продаже
          изделий.
        </p>
        <section className={styles.section}>
          <h2>Что вы можете сделать на платформе</h2>
          <ul>
            <li>создавать и публиковать мастер-классы;</li>
            <li>оценивать и оставлять отзывы о работах других авторов;</li>
            <li>покупать и продавать товары в маркетплейсе;</li>
            <li>общаться с авторами и следить за новыми публикациями;</li>
            <li>управлять собственным профилем и творческим портфолио.</li>
          </ul>
        </section>
      </div>
    </PageWrapper>
  );
}

export default AboutPage;
