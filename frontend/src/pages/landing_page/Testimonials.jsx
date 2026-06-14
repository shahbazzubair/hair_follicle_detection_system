import React, { useEffect, useState } from 'react';
import styles from './Testimonials.module.css';
import Sarah from '../../assets/Sara.jpg'; 
import Ahmed from '../../assets/Ahmed.jpg'; 
import Usman from '../../assets/Usman.jpg'; 

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Dr. Usman Khalid",
      role: "Dermatologist",
      text: "The VGG19 CNN model used here provides incredibly accurate follicle counts. It has significantly streamlined how I generate reports for my patients.",
      avatar: Usman
    },
    {
      id: 2,
      name: "Ahmed Khan",
      role: "Patient",
      text: "Being able to upload my scalp images from home and get a professional analysis based on the Norwood scale is a game changer for tracking my progress.",
      avatar: Ahmed
    },
    {
      id: 3,
      name: "Dr. Sarah Smith",
      role: "Trichology Specialist",
      text: "The precision in detecting hair density patterns is clinical-grade. This is a must-have tool for any modern hair restoration clinic.",
      avatar: Sarah
    }
  ];

  const [current, setCurrent] = useState(0);

  // React strictly controls the timing now
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    }, 4000); // 4 seconds gives slightly more time to read
    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <section className={styles.testimonialSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Trusted by <span>Experts & Patients</span>
        </h2>
        <p className={styles.subtitle}>
          See how our AI-driven analysis is transforming hair health diagnostics.
        </p>

        <div className={styles.slider}>
          <div
            className={styles.sliderTrack}
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {reviews.map((review) => (
              <div key={review.id} className={styles.slide}>
                <div className={styles.card}>
                  <div className={styles.quoteIcon}>"</div>
                  <p className={styles.feedback}>{review.text}</p>
                  
                  <div className={styles.profile}>
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className={styles.avatar}
                    />
                    <div className={styles.info}>
                      <h4 className={styles.name}>{review.name}</h4>
                      <p className={styles.role}>{review.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;