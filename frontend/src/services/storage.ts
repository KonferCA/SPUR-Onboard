import { getApiUrl, HttpStatusCode } from '@utils';
import { ApiError } from './errors';

interface UploadResponse {
  file_url: string;
}

export async function uploadFile(file: File): Promise<string> {
  const url = getApiUrl('/storage/upload');
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({ message: 'Upload failed' }));
      console.error('Upload failed:', json);
      throw new ApiError('Failed to upload file', res.status, json);
    }

    const json = await res.json();
    return (json as UploadResponse).file_url;
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
} 