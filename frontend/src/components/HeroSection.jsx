// src/components/HeroSection.jsx
import React from 'react';
import '../styles/HeroSection.css';

const heroBlocksData = [
  {
    title: 'Horarios y Aranceles',
    image: '/horarios_aranceles.png',
    pdf: '/horarios_aranceles.pdf', // Ruta al PDF en la carpeta public
  },
  {
    title: 'Cursos y Talleres',
    image: '/cursos_talleres.jpg',
    pdf: '/cursos_cortos.pdf', // Ruta al PDF en la carpeta public
  },
  {
    title: 'Malla Masoterapia 2026',
    image: '/descargar_malla.png',
    pdf: '/malla_masoterapia_2026.pdf', // Ruta al PDF en la carpeta public
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
            <img src={block.image} alt={block.title} />
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
