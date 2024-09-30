// src/components/FileUploader.js
import React from 'react';

function FileUploader({ onFileChange }) {
  return (
    <div>
      <input type="file" onChange={onFileChange} />
    </div>
  );
}

export default FileUploader;
