// src/components/HeroSection.jsx
import React from 'react';
import '../styles/HeroSection.css';

const heroBlocksData = [
  {
    title: 'Masoterapia',
    image: '/B1.png',
    pdf: '/masoterapia.pdf', // Ruta al PDF en la carpeta public
  },
  {
    title: 'Reiki',
    image: '/B2.png',
    pdf: '/reiki.pdf', // Ruta al PDF en la carpeta public
  },
  {
    title: 'Aromaterapia',
    image: '/B3.png',
    pdf: '/aromaterapia.pdf', // Ruta al PDF en la carpeta public
  },
];

const HeroSection = () => {
  return (
    <section className="hero-section">
      {heroBlocksData.map((block, index) => (
        <div key={index} className={`hero-block block-${index + 1}`}>
          <div>
            <h2>{block.title}</h2>
          </div>
          <a href={block.pdf} target="_blank" rel="noopener noreferrer" className="hero-image-link" aria-label={`Descargar ${block.title}`}>
            <img src={process.env.PUBLIC_URL + block.image} alt={block.title} />
          </a>
          <div className="hero-block-footer">
            <p>Descargar</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default HeroSection;
