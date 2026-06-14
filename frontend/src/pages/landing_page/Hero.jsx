import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';
import baldHeadImage from '../../assets/bald_head.png'; 

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.badge}>Next-Gen Trichology</span>
          <h1 className={styles.title}>
            Clinical Hair Analysis <br/>
            Through <span>Deep Learning</span>
          </h1>
          <p className={styles.description}>
            Transforming scalp diagnostics with automated follicle detection, 
            density mapping, and growth tracking. Built for professionals, 
            accessible to everyone.
          </p>
          <div className={styles.btnGroup}>
            <Link to="/methodology" className={styles.btnPrimary}>
              View Methodology
            </Link>
          </div>
        </div>
        
        <div className={styles.imageWrapper}>
          <img src={baldHeadImage} alt="Scalp Analysis" className={styles.baldImage} />
          <div className={styles.scanOverlay}>
            <div className={styles.scanningLine}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;