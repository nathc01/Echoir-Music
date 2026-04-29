'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Music, Image as ImageIcon, Type, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Indie Pop');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select an audio file to upload.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('genre', genre);
    formData.append('description', description);
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert("Upload successful!");
        router.push('/');
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="upload-title text-gradient">Upload Your Masterpiece</h1>
        <p className="upload-subtitle">Share your latest indie track with the world and get discovered.</p>
      </div>

      <div className="glass upload-form-card">
        <form className="upload-form" onSubmit={handleSubmit}>
          
          {/* Audio Upload Area */}
          <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              accept="audio/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="dropzone-icon-wrapper">
              <UploadCloud size={32} />
            </div>
            <h3 className="dropzone-title">
              {file ? file.name : "Drag & Drop your Audio File"}
            </h3>
            <p className="dropzone-subtitle">
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "WAV, FLAC, or high-quality MP3 (Max 50MB)"}
            </p>
            <button type="button" className="btn-browse">
              Browse Files
            </button>
          </div>

          <div className="upload-grid">
            <div className="form-col">
              <div className="form-group">
                <label className="form-label flex-icon"><Type size={16} /> Track Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Midnight City Lights" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label flex-icon"><Music size={16} /> Genre</label>
                <select 
                  className="form-select"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  <option>Indie Pop</option>
                  <option>Shoegaze</option>
                  <option>Synthwave</option>
                  <option>Indie Rock</option>
                  <option>Dream Pop</option>
                  <option>Alternative</option>
                </select>
              </div>
            </div>

            <div className="form-col">
              {/* Cover Art Upload Area */}
              <div className="form-group cover-group">
                <label className="form-label flex-icon"><ImageIcon size={16} /> Cover Art</label>
                <div className="cover-dropzone">
                   <div className="cover-overlay"></div>
                   <div className="cover-content">
                     <ImageIcon size={24} className="cover-icon" />
                     <span className="cover-text">Upload Image</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Lyrics</label>
            <textarea 
              className="form-textarea" 
              placeholder="Tell the story behind this track, or paste the lyrics here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="upload-actions">
            <button type="submit" className="btn-primary btn-publish" disabled={isUploading}>
              <Save size={18} />
              {isUploading ? "Publishing..." : "Publish Track"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
