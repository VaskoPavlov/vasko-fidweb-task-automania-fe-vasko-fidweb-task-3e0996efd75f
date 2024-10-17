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

  const [mainPhotoFile, setMainPhotoFile] = useState(null);
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
    if (!listingData.mainPhoto.trim()) newErrors.mainPhoto = 'Main photo is required';

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

  const handleMainPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainPhotoFile(file);
      setListingData({ ...listingData, mainPhoto: URL.createObjectURL(file) });
    }
  };

  const removeMainPhoto = () => {
    setMainPhotoFile(null);
    setListingData({ ...listingData, mainPhoto: '' });
  };

  const removeAdditionalPhoto = (index) => {
    const updatedPhotos = listingData.additionalPhotos.filter((_, i) => i !== index);
    setListingData({ ...listingData, additionalPhotos: updatedPhotos });
  };

  return (
    <div className={styles.createListingContainer}>
      <div className={styles.header}>
        <div className={styles.titlePlusX}>
          <button onClick={() => navigate('/listing/list')} className={styles.closeButton}></button>
          <h2>Edit Listing</h2>
        </div>
        <button className={styles.saveButton} onClick={handleSaveListing}>
          Save Listing
        </button>
      </div>
      <div className={styles.divider}></div>
      <form className={styles.listingForm}>
        <h3>GENERAL INFO</h3>
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
            <span className={styles.currency}>BGN</span>
            </div>
            {errors.price && <p className={styles.error}>{errors.price}</p>}
          </div>
        </div>
        <div className={styles.blueDivider}></div>
        <h3>PHOTOS</h3>
        <div className={styles.photosSection}>
          <div className={styles.inputGroupPhoto}>
            <label>Main Photo</label>
            {listingData.mainPhoto ? (
              <div className={styles.uploadedPhoto}>
                <p>{mainPhotoFile ? mainPhotoFile.name : listingData.mainPhoto}</p>
                <button className={styles.removeButton} onClick={removeMainPhoto}>X</button>
              </div>
            ) : (
              <label htmlFor="mainPhotoUpload" className={styles.uploadButton}>
                + UPLOAD
              </label>
            )}
            <input
              type="file"
              id="mainPhotoUpload"
              className={styles.fileInput}
              onChange={handleMainPhotoChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            {errors.mainPhoto && <p className={styles.error}>{errors.mainPhoto}</p>}
          </div>

          {/* Additional Photos */}
          <div className={styles.inputGroupPhoto}>
            <label>Additional Photos</label>
            <div className={styles.additionalPhotos}>
              {listingData.additionalPhotos.length < 5 && (
                <label htmlFor="additionalPhotosUpload" className={styles.uploadButton}>
                  + UPLOAD
                </label>
              )}
              {listingData.additionalPhotos.map((photo, index) => (
                <div key={index} className={styles.uploadedPhoto}>
                  <p>{photo}</p>
                  <button className={styles.removeButton} onClick={() => removeAdditionalPhoto(index)}>X</button>
                </div>
              ))}
            </div>
            <input
              type="file"
              id="additionalPhotosUpload"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
                setListingData({ ...listingData, additionalPhotos: [...listingData.additionalPhotos, ...files] });
              }}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
