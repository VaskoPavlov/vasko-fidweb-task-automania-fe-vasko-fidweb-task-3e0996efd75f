import React, { useState, useRef } from 'react';
import styles from './create.module.css';
import { useNavigate } from 'react-router';

export default function Create() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [mainPhotoFile, setMainPhotoFile] = useState(null); 
  const [additionalPhotosFiles, setAdditionalPhotosFiles] = useState([]); 

  const [errors, setErrors] = useState({});  

  const formRef = useRef(null);
  const hiddenSubmitButtonRef = useRef(null);
  const navigate = useNavigate();

  const truncateFileName = (name, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    const extIndex = name.lastIndexOf(".");
    const ext = name.substring(extIndex); 
    const truncated = name.substring(0, maxLength - ext.length - 3); 
    return `${truncated}...${ext}`;
  };

  const validate = () => {
    const newErrors = {};

    if (!brand.trim()) newErrors.brand = 'Brand is required';
    if (!model.trim()) newErrors.model = 'Model is required';
    if (!price || isNaN(price) || parseFloat(price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!mainPhotoFile) newErrors.mainPhoto = 'Main photo is required';  

    setErrors(newErrors);  

    return Object.keys(newErrors).length === 0;
  };

  const triggerFormSubmission = () => {
    if (validate()) {
      hiddenSubmitButtonRef.current.click();  
    }
  };

  const handleMainPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainPhotoFile(file);
    }
  };

  const handleAdditionalPhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalPhotosFiles([...additionalPhotosFiles, ...files]);
  };

  const removeMainPhoto = () => {
    setMainPhotoFile(null);
  };

  const removeAdditionalPhoto = (index) => {
    const updatedFiles = additionalPhotosFiles.filter((_, i) => i !== index);
    setAdditionalPhotosFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('You must be logged in to create a listing.');
      return;
    }

    try {
      const uploadedMainPhotoUrl = await uploadImage(mainPhotoFile, token);
      const uploadedAdditionalPhotosUrls = await Promise.all(
        additionalPhotosFiles.map(file => uploadImage(file, token))
      );

      const listingData = {
        brand,
        model,
        price: parseFloat(price),
        mainPhoto: uploadedMainPhotoUrl,
        additionalPhotos: uploadedAdditionalPhotosUrls  
      };

      const response = await fetch('https://automania.herokuapp.com/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(listingData),
      });

      const result = await response.json();

      if (result.success) {
        navigate('/listing/list');
      } else {
        alert('Failed to create listing.');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const uploadImage = async (file, token) => {
    const formData = new FormData();
    formData.append('images', file);

    const response = await fetch('https://automania.herokuapp.com/file/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, 
      },
      body: formData,
    });

    const result = await response.json();
    return result.payload[0].url; 
  };

  return (
    <div className={styles.createListingContainer}>
      <div className={styles.header}>
        <div className={styles.titlePlusX}>
          <button onClick={() => navigate('/listing/list')} className={styles.closeButton}></button>
          <h2 id="h2">New Listing</h2>
        </div>
        <div className={styles.saveButtonContainer}>
          <button
            type="button"
            className={styles.saveButton}
            onClick={triggerFormSubmission} 
          >
            Save Listing
          </button>
        </div>
      </div>
      <div className={styles.divider}></div>
      <form ref={formRef} className={styles.listingForm} onSubmit={handleSubmit}>
        <h3>GENERAL INFO</h3>
        <div className={styles.generalInfoSection}>
          <div className={styles.inputGroupBrand}>
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
            {errors.brand && <p className={styles.error}>{errors.brand}</p>} 
          </div>
          <div className={styles.inputGroupModel}>
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
            {errors.model && <p className={styles.error}>{errors.model}</p>} 
          </div>
          <div className={styles.priceGroup}>
            <div className={styles.inputPrice}>
            <label htmlFor="price">Price</label>
              <input
                type="text"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <span className={styles.currency}>BGN</span>
            </div>
            {errors.price && <p className={styles.error}>{errors.price}</p>}  
          </div>
        </div>
        <div className={styles.blueDivider}></div>

        {/* PHOTOS SECTION */}
        <h3>PHOTOS</h3>
        <div className={styles.photosSection}>
          {/* Main Photo */}
          <div className={styles.inputGroupPhoto}>
            <label>Main Photo</label>
            {mainPhotoFile ? (
              <div className={styles.uploadedPhoto}>
                <p>{truncateFileName(mainPhotoFile.name)}</p>
                <button className={styles.removeButton} onClick={removeMainPhoto}>✖</button>
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
              {additionalPhotosFiles.map((photo, index) => (
                <div key={index} className={styles.uploadedPhoto}>
                  <p>{truncateFileName(photo.name)}</p>
                  <button className={styles.removeButton} onClick={() => removeAdditionalPhoto(index)}>✖</button>
                </div>
              ))}
              {additionalPhotosFiles.length < 5 && (
                <label htmlFor="additionalPhotosUpload" className={styles.uploadButton}>
                  + UPLOAD
                </label>
              )}
            </div>
            <input
              type="file"
              id="additionalPhotosUpload"
              multiple
              onChange={handleAdditionalPhotosChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
