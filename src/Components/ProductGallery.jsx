import React, { useState } from 'react';
import './ProductGallery.css';
import AppScene from './AppScene.js';
import loungechair from './Assets/loungechair.png';

const ProductGallery = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    { id: 1, name: "Modern Sofa", price: "$499", image: "https://via.placeholder.com/150" },
    { id: 2, name: "Wooden Table", price: "$299", image: "https://via.placeholder.com/150" },
    { id: 3, name: "Lounge Chair", price: "$199", image: loungechair },
    { id: 4, name: "Decorative Lamp", price: "$99", image: "https://via.placeholder.com/150" },
    { id: 5, name: "Dining Set", price: "$899", image: "https://via.placeholder.com/150" },
    { id: 6, name: "Bookshelf", price: "$399", image: "https://via.placeholder.com/150" },
    { id: 7, name: "TV Stand", price: "$249", image: "https://via.placeholder.com/150" },
    { id: 8, name: "Outdoor Chair", price: "$129", image: "https://via.placeholder.com/150" },
    { id: 9, name: "Wall Art", price: "$79", image: "https://via.placeholder.com/150" },
    { id: 10, name: "Coffee Table", price: "$199", image: "https://via.placeholder.com/150" },
  ];

  return (
    <div id="product-gallery" className="product-gallery">
      <h2>Our Products</h2>
      <div className="products">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <button onClick={() => setSelectedProduct(product)}>View</button>
          </div>
        ))}
      </div>

      {selectedProduct && <AppScene onClose={() => setSelectedProduct(null)} />}
    </div>
  );
};

export default ProductGallery;