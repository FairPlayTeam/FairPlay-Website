import React from 'react';
import styles from './notImplementedSection.module.css';

export const NotImplementedSection = () => {
  return (
    <div className={styles.container}>
      <img
        src="./images/feature-not-available.png"
        alt="Feature not available"
        className={styles.image}
      />
      <h2 className={styles.title}>Nothing here yet</h2>
      <p className={styles.text}>
        Help us to make this feature!{' '}
        <a href="http://fairplay.video/contributors" className={styles.link}>
          Take a look at #contributors
        </a>
      </p>
    </div>
  );
};
