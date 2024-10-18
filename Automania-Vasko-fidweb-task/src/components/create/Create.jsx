import React, { useState, useRef } from 'react';
import * as styles from './create.module.css'; // Import desktop styles
import * as mobileStyles from './createMobile.module.css'; // Import mobile styles
import { useNavigate } from 'react-router';
import { useWindowWidth } from '../../hooks/useWindowWidth'; // Import mobile detection hook

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
  const isMobile = useWindowWidth(); // Check if it's a mobile device

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

  const handleMainPhotoChange = (e) => setMainPhotoFile(e.target.files[0]);
  const handleAdditionalPhotosChange = (e) => setAdditionalPhotosFiles([...additionalPhotosFiles, ...Array.from(e.target.files)]);
  
  const removeMainPhoto = () => setMainPhotoFile(null);
  const removeAdditionalPhoto = (index) => setAdditionalPhotosFiles(additionalPhotosFiles.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

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

  const renderDesktopView = () => (
    <div className={styles.createListingContainer}>
      <div className={styles.header}>
        <h2 id="h2">New Listing</h2>
      </div>
      <form ref={formRef} className={styles.listingForm} onSubmit={handleSubmit}>
        <h3>GENERAL INFO</h3>
        <div className={styles.generalInfoSection}>
          <div className={styles.inputGroupBrand}>
            <label htmlFor="brand">Brand</label>
            <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            {errors.brand && <p className={styles.error}>{errors.brand}</p>}
          </div>

          <div className={styles.inputGroupModel}>
            <label htmlFor="model">Model</label>
            <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} required />
            {errors.model && <p className={styles.error}>{errors.model}</p>}
          </div>

          <div className={styles.priceGroup}>
            <label htmlFor="price">Price</label>
            <input type="text" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <span className={styles.currency}>BGN</span>
            {errors.price && <p className={styles.error}>{errors.price}</p>}
          </div>
        </div>

        <h3>PHOTOS</h3>
        <div className={styles.photosSection}>
          <div className={styles.inputGroupPhoto}>
            <label>Main Photo</label>
            {mainPhotoFile ? (
              <div className={styles.uploadedPhoto}>
                <p>{truncateFileName(mainPhotoFile.name)}</p>
                <button className={styles.removeButton} onClick={removeMainPhoto}>X</button>
              </div>
            ) : (
              <label htmlFor="mainPhotoUpload" className={styles.uploadButton}>+ UPLOAD</label>
            )}
            <input type="file" id="mainPhotoUpload" onChange={handleMainPhotoChange} accept="image/*" style={{ display: 'none' }} />
            {errors.mainPhoto && <p className={styles.error}>{errors.mainPhoto}</p>}
          </div>

          <div className={styles.inputGroupPhoto}>
            <label>Additional Photos</label>
            <div className={styles.additionalPhotos}>
              {additionalPhotosFiles.map((photo, index) => (
                <div key={index} className={styles.uploadedPhoto}>
                  <p>{truncateFileName(photo.name)}</p>
                  <button className={styles.removeButton} onClick={() => removeAdditionalPhoto(index)}>X</button>
                </div>
              ))}
              {additionalPhotosFiles.length < 5 && (
                <label htmlFor="additionalPhotosUpload" className={styles.uploadButton}>+ UPLOAD</label>
              )}
            </div>
            <input type="file" id="additionalPhotosUpload" multiple onChange={handleAdditionalPhotosChange} accept="image/*" style={{ display: 'none' }} />
          </div>
        </div>

        <div className={styles.saveButtonContainer}>
          <button type="submit" className={styles.saveButton}>Save Listing</button>
        </div>
      </form>
    </div>
  );

  const renderMobileView = () => (
    <div className={mobileStyles.createListingContainer}>
      <div className={mobileStyles.header}>
        <h2 id="h2">New Listing</h2>
      </div>
      <form ref={formRef} className={mobileStyles.listingForm} onSubmit={handleSubmit}>
        <h3>GENERAL INFO</h3>
        <div className={mobileStyles.generalInfoSection}>
          <div className={mobileStyles.inputGroupBrand}>
            <label htmlFor="brand">Brand</label>
            <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            {errors.brand && <p className={mobileStyles.error}>{errors.brand}</p>}
          </div>

          <div className={mobileStyles.inputGroupModel}>
            <label htmlFor="model">Model</label>
            <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} required />
            {errors.model && <p className={mobileStyles.error}>{errors.model}</p>}
          </div>

          <div className={mobileStyles.priceGroup}>
            <label htmlFor="price">Price</label>
            <input type="text" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <span className={mobileStyles.currency}>BGN</span>
            {errors.price && <p className={mobileStyles.error}>{errors.price}</p>}
          </div>
        </div>

        <h3>PHOTOS</h3>
        <div className={mobileStyles.photosSection}>
          <div className={mobileStyles.inputGroupPhoto}>
            <label>Main Photo</label>
            {mainPhotoFile ? (
              <div className={mobileStyles.uploadedPhoto}>
                <p>{truncateFileName(mainPhotoFile.name)}</p>
                <button className={mobileStyles.removeButton} onClick={removeMainPhoto}>X</button>
              </div>
            ) : (
              <label htmlFor="mainPhotoUpload" className={mobileStyles.uploadButton}>+ UPLOAD</label>
            )}
            <input type="file" id="mainPhotoUpload" onChange={handleMainPhotoChange} accept="image/*" style={{ display: 'none' }} />
            {errors.mainPhoto && <p className={mobileStyles.error}>{errors.mainPhoto}</p>}
          </div>

          <div className={mobileStyles.inputGroupPhoto}>
            <label>Additional Photos</label>
            <div className={mobileStyles.additionalPhotos}>
              {additionalPhotosFiles.map((photo, index) => (
                <div key={index} className={mobileStyles.uploadedPhoto}>
                  <p>{truncateFileName(photo.name)}</p>
                  <button className={mobileStyles.removeButton} onClick={() => removeAdditionalPhoto(index)}>X</button>
                </div>
              ))}
              {additionalPhotosFiles.length < 5 && (
                <label htmlFor="additionalPhotosUpload" className={mobileStyles.uploadButton}>+ UPLOAD</label>
              )}
            </div>
            <input type="file" id="additionalPhotosUpload" multiple onChange={handleAdditionalPhotosChange} accept="image/*" style={{ display: 'none' }} />
          </div>
        </div>

        <div className={mobileStyles.saveButtonContainer}>
          <button type="submit" className={mobileStyles.saveButton}>Save Listing</button>
        </div>
      </form>
    </div>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
}
