import React from "react";
import PageWrapper from "../../components/common/PageWrapper/PageWrapper";
import styles from "./AboutPage.module.css";

function AboutPage() {
  return (
    <PageWrapper>
      <div className={styles.aboutContainer}>
        <h1 className={styles.title}>О проекте</h1>        <p className={styles.date}>Дата последнего обновления: 30 мая 2026 г.</p>        <p className={styles.subtitle}>
          CreativeLab — платформа для творческих людей, которые хотят делиться
          мастер-классами и продавать свои работы.
        </p>

        <section className={styles.section}>
          <h2>Наша миссия</h2>
          <p>
            Мы создаём пространство для авторов и ценителей ручной работы, где
            каждый может найти вдохновение, научиться новому и
            продемонстрировать свои навыки.
          </p>
        </section>

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

        <section className={styles.section}>
          <h2>Почему Creative Lab</h2>
          <p>
            Платформа объединяет удобный интерфейс, прозрачные условия и
            возможность монетизировать своё творчество. Мы поддерживаем авторов
            на всех этапах: от идеи до продажи.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Контакты</h2>
          <p>
            Если у вас есть предложения или вопросы, пишите на&nbsp;
            <a className={styles.link} href="mailto:support@creativelab.by">
              support@creativelab.by
            </a>
            .
          </p>
        </section>
      </div>
    </PageWrapper>
  );
}

export default AboutPage;
