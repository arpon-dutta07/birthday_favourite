import React, { useState, useRef } from 'react';
import { Heart, Upload, X, RotateCcw, Copy, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage, encodePayload } from '../utils/compression';
import ShareLinkModal from './ShareLinkModal';

interface ImageData {
  name: string;
  dataUrl: string;
  id: string;
}

interface FormData {
  name: string;
  age: string;
  message: string;
  images: ImageData[];
}

const CreateForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    message: '',
    images: []
  });
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const newWarnings = [];
    const remainingSlots = 10 - formData.images.length;
    
    if (files.length > remainingSlots) {
      newWarnings.push(`Only ${remainingSlots} image slots available. Extra images ignored.`);
    }
    
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newImages: ImageData[] = [];
    
    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) continue;
      
      try {
        const compressedDataUrl = await compressImage(file);
        newImages.push({
          id: Date.now() + Math.random().toString(),
          name: file.name,
          dataUrl: compressedDataUrl
        });
      } catch (error) {
        newWarnings.push(`Failed to process ${file.name}`);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    
    setWarnings(newWarnings);
    setTimeout(() => setWarnings([]), 5000);
  };



  const removeImage = (id: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };

  const replaceImage = async (id: string, file: File) => {
    try {
      const compressedDataUrl = await compressImage(file);
      setFormData(prev => ({
        ...prev,
        images: prev.images.map(img => 
          img.id === id 
            ? { ...img, name: file.name, dataUrl: compressedDataUrl }
            : img
        )
      }));
    } catch (error) {
      setWarnings(['Failed to process replacement image']);
      setTimeout(() => setWarnings([]), 3000);
    }
  };

  const generateLink = async () => {
    if (!formData.name.trim()) {
      setWarnings(['Recipient name is required']);
      return;
    }

    if (formData.images.length === 0) {
      setWarnings(['At least one image is required for the romantic intro']);
      return;
    }

    setIsGenerating(true);
    setWarnings([]);

    try {
      const payload = {
        ...formData,
        createdAt: new Date().toISOString()
      };

      const encodedUrl = encodePayload(payload);
      
      // Create a shorter URL if the original is too long
      let finalUrl = encodedUrl;
      if (encodedUrl.length > 2000) {
        try {
          const { URLShortener } = await import('../utils/urlShortener');
          finalUrl = URLShortener.createShortUrl(encodedUrl);
          setWarnings(['Created shorter URL for better sharing!']);
        } catch (error) {
          setWarnings(['Warning: URL is long due to large images. Consider using smaller images.']);
        }
      }

      setShareUrl(finalUrl);
      setShowShareModal(true);
    } catch (error) {
      setWarnings(['Failed to generate link. Try reducing image sizes.']);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-4 font-inter">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Heart className="w-12 h-12 text-pink-300 mx-auto mb-4" />
          <h1 className="text-4xl font-playfair font-bold text-white mb-2">
            Create a Magical Birthday Surprise
          </h1>
          <p className="text-pink-200">Design a romantic, cinematic experience for someone special</p>
        </motion.div>

        {/* Warnings */}
        <AnimatePresence>
          {warnings.map((warning, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-500/20 border border-amber-400 text-amber-100 px-4 py-3 rounded-lg mb-4 flex items-center"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              {warning}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Name */}
          <div>
            <label className="block text-white font-medium mb-2">
              Recipient's Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              placeholder="Enter their name..."
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-white font-medium mb-2">Age (optional)</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              placeholder="How old are they turning?"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-white font-medium mb-2">Personal Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 resize-none"
              placeholder="Write your heartfelt birthday message... (emojis welcome! 🎂💖)"
            />
            <div className="text-right text-sm text-white/60 mt-1">
              {formData.message.length}/500
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-white font-medium mb-2">
              Images for Romantic Intro (up to 10)
            </label>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-pink-400 transition-colors"
            >
              <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <p className="text-white/80 mb-2">Click to upload images</p>
              <p className="text-sm text-white/60">
                Images will be automatically resized and compressed
              </p>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />

            {/* Image Thumbnails */}
            {formData.images.length > 0 && (
              <div className="thumbnail-grid mt-4">
                {formData.images.map((image, index) => (
                  <div key={image.id} className="thumbnail-container group">
                    <img
                      src={image.dataUrl}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <label className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors cursor-pointer">
                        <RotateCcw className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && replaceImage(image.id, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>



          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={generateLink}
              disabled={isGenerating || !formData.name.trim() || formData.images.length === 0}
              className="flex-1 btn-romantic text-white font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  <span>Generate Magical Link</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Share Link Modal */}
        <ShareLinkModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareUrl={shareUrl}
        />
      </div>
    </div>
  );
};

export default CreateForm;