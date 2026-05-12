'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Music, Image as ImageIcon, Type, Save, Mic2, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [musicianName, setMusicianName] = useState('');
  const [genre, setGenre] = useState('Indie Pop');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverFile(file);
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      alert("Pilih file audio terlebih dahulu.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('musicianName', musicianName);
    formData.append('genre', genre);
    formData.append('description', description);
    formData.append('lyrics', lyrics);
    formData.append('file', audioFile);
    if (coverFile) {
      formData.append('cover', coverFile);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert("Upload berhasil! Lagu kamu sudah ditambahkan.");
        router.push('/');
      } else {
        alert("Upload gagal: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Terjadi kesalahan saat upload.");
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
          <div className="upload-dropzone" onClick={() => audioInputRef.current?.click()}>
            <input 
              type="file" 
              accept="audio/*" 
              style={{ display: 'none' }} 
              ref={audioInputRef}
              onChange={handleAudioChange}
            />
            <div className="dropzone-icon-wrapper">
              <UploadCloud size={32} />
            </div>
            <h3 className="dropzone-title">
              {audioFile ? audioFile.name : "Drag & Drop your Audio File"}
            </h3>
            <p className="dropzone-subtitle">
              {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` : "WAV, FLAC, atau MP3 berkualitas tinggi (Maks 50MB)"}
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
                <label className="form-label flex-icon"><UserCircle size={16} /> Musician / Artist Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Lizzy McAlpine, NIKI, Daniel Caesar" 
                  value={musicianName}
                  onChange={(e) => setMusicianName(e.target.value)}
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
                  <option>R&B / Neo-Soul</option>
                  <option>Indie Folk</option>
                  <option>Lo-Fi Beats</option>
                </select>
              </div>
            </div>

            <div className="form-col">
              {/* Cover Art Upload Area */}
              <div className="form-group cover-group">
                <label className="form-label flex-icon"><ImageIcon size={16} /> Cover Art</label>
                <div 
                  className="cover-dropzone" 
                  onClick={() => coverInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={coverInputRef}
                    onChange={handleCoverChange}
                  />
                  {coverPreview ? (
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      style={{ objectFit: 'cover', borderRadius: '12px' }}
                    />
                  ) : (
                    <>
                      <div className="cover-overlay"></div>
                      <div className="cover-content">
                        <ImageIcon size={24} className="cover-icon" />
                        <span className="cover-text">Upload Image</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              placeholder="Ceritakan latar belakang lagu ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label flex-icon"><Mic2 size={16} /> Lyrics</label>
            <textarea 
              className="form-textarea" 
              placeholder={`Tempel lirik lagu di sini...

[Verse 1]
Tulis lirik bait pertama...

[Chorus]
Tulis reff di sini...`}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={8}
              style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.7' }}
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
