/**
 * Client-Side PDF & Image Page Renderer & Text Extraction Utility
 * Converts uploaded PDF documents and image files into high-resolution image data URLs
 * and extracts text for AI assessment and bounding box mapping.
 */

export interface ProcessedDocumentResult {
  pageImageUrls: string[];
  pageTexts: string[];
}

/**
 * Configure PDF.js worker dynamically in browser environment
 */
async function getPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF rendering can only be executed in a browser environment');
  }

  const pdfjs = await import('pdfjs-dist');
  
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  return pdfjs;
}

/**
 * Renders each page of a PDF File into high-resolution data URLs and extracts page text.
 */
export async function renderPdfToImageUrlsAndTexts(
  file: File,
  scale: number = 1.5
): Promise<ProcessedDocumentResult> {
  try {
    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const pageImageUrls: string[] = [];
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      // Extract raw text content from the PDF page
      try {
        const textContent = await page.getTextContent();
        const extractedText = textContent.items
          .map((item) => (typeof item === 'object' && item !== null && 'str' in item ? String((item as { str: string }).str) : ''))
          .filter(Boolean)
          .join(' ');
        pageTexts.push(extractedText);
      } catch (textErr) {
        console.warn(`Could not extract text from page ${pageNum}:`, textErr);
        pageTexts.push('');
      }

      // Create an offscreen canvas for rendering the page image
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d', { alpha: false });

      if (!context) {
        throw new Error(`Failed to get 2D rendering context for PDF page ${pageNum}`);
      }

      // Fill background with clean white
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport,
        canvas,
      };

      await page.render(renderContext).promise;

      // Convert canvas to optimized JPEG data URL (0.85 quality for crisp OCR with low payload)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      pageImageUrls.push(dataUrl);
    }

    return { pageImageUrls, pageTexts };
  } catch (error) {
    console.error('Error rendering PDF to image URLs:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to render PDF: ${error.message}` 
        : 'Failed to render PDF pages'
    );
  }
}

/**
 * Backward compatible wrapper returning only pageImageUrls
 */
export async function renderPdfToImageUrls(
  file: File,
  scale: number = 1.5
): Promise<string[]> {
  const result = await renderPdfToImageUrlsAndTexts(file, scale);
  return result.pageImageUrls;
}

/**
 * Reads an image file and returns its Base64 Data URL.
 */
export function readImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image as data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Image file read error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Universal document processor:
 * Accepts any uploaded File (PDF, PNG, JPEG, WEBP) and returns an array of Page Image Data URLs.
 */
export async function processUploadedDocument(file: File): Promise<string[]> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return await renderPdfToImageUrls(file);
  }

  // Handle standard image files
  const imageDataUrl = await readImageFileToDataUrl(file);
  return [imageDataUrl];
}

/**
 * Universal document processor with text extraction
 */
export async function processUploadedDocumentWithText(file: File): Promise<ProcessedDocumentResult> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return await renderPdfToImageUrlsAndTexts(file);
  }

  const imageDataUrl = await readImageFileToDataUrl(file);
  return { pageImageUrls: [imageDataUrl], pageTexts: [] };
}
