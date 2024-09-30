// src/components/PDFViewer.js
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// You need to manually set the workerSrc to point to the PDF.js worker file.
// This file is responsible for handling the heavy lifting of parsing the PDF data.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function PDFViewer({ file }) {
  return (
    <div>
      <Document file={file} loading="Loading PDF...">
        <Page pageNumber={1} />
      </Document>
    </div>
  );
}

export default PDFViewer;
