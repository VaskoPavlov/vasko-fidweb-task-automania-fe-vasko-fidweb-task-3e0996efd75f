import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../create/create.module.css';  

export default function Edit() {
  const { _id } = useParams(); 
  const navigate = useNavigate();
  const [listingData, setListingData] = useState({
    brand: '',
    model: '',
    price: '',
    mainPhoto: '',
    additionalPhotos: [],
  });

  const [errors, setErrors] = useState({}); 

  useEffect(() => {
    
    const fetchListing = async () => {
      try {
        const response = await fetch(`https://automania.herokuapp.com/listing/${_id}`);
        const result = await response.json();
        if (result.success) {
          setListingData(result.payload);
        } else {
          alert('Failed to load listing data.');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      }
    };

    fetchListing();
  }, [_id]);

  const validate = () => {
    const newErrors = {};

    if (!listingData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!listingData.model.trim()) newErrors.model = 'Model is required';
    if (!listingData.price || isNaN(listingData.price) || parseFloat(listingData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (!listingData.mainPhoto.trim()) newErrors.mainPhoto = 'Main photo URL is required';

    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveListing = async () => {
    if (!validate()) return;  

    try {
      const response = await fetch(`https://automania.herokuapp.com/listing/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,  
        },
        body: JSON.stringify({
          brand: listingData.brand,
          model: listingData.model,
          price: listingData.price,
          mainPhoto: listingData.mainPhoto,
          additionalPhotos: listingData.additionalPhotos,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Listing updated successfully!');
        navigate('/listing/list'); 
      } else {
        alert('Failed to update the listing.');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
    }
  };

  return (
    <div className={styles.createListingContainer}>
      <div className={styles.header}>
        <button onClick={() => navigate('/listing/list')} className={styles.closeButton}></button>
        <h2>Edit Listing</h2>
        <button className={styles.saveButton} onClick={handleSaveListing}>
          Save Listing
        </button>
      </div>
      <div className={styles.divider}></div>
      <form className={styles.listingForm}>
        <div className={styles.generalInfoSection}>
          <div className={styles.inputGroupBrand}>
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              value={listingData.brand}
              onChange={(e) => setListingData({ ...listingData, brand: e.target.value })}
              required
            />
            {errors.brand && <p className={styles.error}>{errors.brand}</p>}
          </div>
          <div className={styles.inputGroupModel}>
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              value={listingData.model}
              onChange={(e) => setListingData({ ...listingData, model: e.target.value })}
              required
            />
            {errors.model && <p className={styles.error}>{errors.model}</p>}
          </div>
          <div className={styles.priceGroup}>
          <div className={styles.inputPrice}>
            <label htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              value={listingData.price}
              onChange={(e) => setListingData({ ...listingData, price: e.target.value })}
              required
            />
            <span class={styles.currency}>BGN</span>
            </div>
            {errors.price && <p className={styles.error}>{errors.price}</p>}
          </div>
        </div>
        <div className={styles.blueDivider}></div>
        <div className={styles.photosSection}>
          <div className={styles.inputGroup}>
            <label>Main Photo</label>
            <input
              type="text"
              id="mainPhotoUpload"
              className={styles.uploadButton}
              value={listingData.mainPhoto}
              onChange={(e) => setListingData({ ...listingData, mainPhoto: e.target.value })}
              required
            />
            {errors.mainPhoto && <p className={styles.error}>{errors.mainPhoto}</p>}
          </div>
          <div className={styles.inputGroup}>
            <label>Additional Photos</label>
            <label htmlFor="additionalPhotosUpload" className={styles.uploadButton}>+ UPLOAD</label>
            <input
              type="file"
              id="additionalPhotosUpload"
              multiple
              onChange={(e) => setListingData({ ...listingData, mainPhoto: e.target.value })}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
            <div className={styles.additionalPhotosList}>
              {listingData.additionalPhotos.map((photo, index) => (
                <p key={index}>{photo}</p>
              ))}
            </div>
        </div>
      </form>
    </div>
  );
}
