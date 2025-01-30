import React from 'react';
import Navbar from '../Components/Navbar/Navbar';
import '../Pages/Homepage.css';
import ProductGallery from '../Components/ProductGallery';

const Homepage = () => {
  
    const scrollToGallery = () => {
      const gallerySection = document.getElementById("product-gallery");
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: "smooth" });
      }
    };
  return (
    <div className="homepage">
      <Navbar />
      <header className="hero-section">
        <div className="hero-content">
        <div className="text-transition">
  <h1>Holo Decor: Where reality meets imagination.</h1>
</div>

          <h2>We emphasize Fast And Quality Work</h2>
          <p>
          Let your creativity flow as you see how new designs fit seamlessly into your space.
          </p>
          <button onClick={scrollToGallery}>Check Out Our Gallery</button>
        </div>
      </header>
      <ProductGallery />
    </div>
  );
};

export default Homepage;
