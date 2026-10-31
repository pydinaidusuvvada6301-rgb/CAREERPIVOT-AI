import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractedResumeText {
  text: string;
  pageCount?: number;
  format: 'pdf' | 'docx' | 'txt';
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractedResumeText> {
  const lowerName = fileName.toLowerCase();

  if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    try {
      const pdfData = await pdfParse(buffer);
      const cleaned = pdfData.text.replace(/\r\n/g, '\n').trim();
      return {
        text: cleaned,
        pageCount: pdfData.numpages,
        format: 'pdf',
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from PDF: ${err.message || 'Corrupted file'}`);
    }
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    lowerName.endsWith('.docx')
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        text: result.value.replace(/\r\n/g, '\n').trim(),
        format: 'docx',
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from DOCX: ${err.message || 'Corrupted file'}`);
    }
  }

  if (mimeType.startsWith('text/') || lowerName.endsWith('.txt')) {
    return {
      text: buffer.toString('utf-8').trim(),
      format: 'txt',
    };
  }

  throw new Error(`Unsupported file type: ${mimeType}. Please upload a PDF, DOCX, or plain text file.`);
}
