import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareLinkModal: React.FC<Props> = ({ isOpen, onClose, shareUrl }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openPreview = () => {
    window.open(shareUrl, '_blank', 'noopener');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-playfair font-bold text-white">
                Your Magical Link is Ready! ✨
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* URL Display */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Shareable Link:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Preview Button */}
            <div className="mb-6">
              <button
                onClick={openPreview}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Preview Your Creation</span>
              </button>
            </div>

            {/* Warnings and Tips */}
            <div className="space-y-4">
              <div className="bg-amber-500/20 border border-amber-400 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div className="text-amber-100">
                    <p className="font-medium mb-1">Important Notes:</p>
                    <ul className="text-sm space-y-1">
                      <li>• The link contains all your images and data encoded within it</li>
                      <li>• Anyone with this link can view the birthday surprise</li>
                      <li>• Share responsibly and keep the link private until the big moment</li>
                      {shareUrl.length > 32768 && (
                        <li className="text-amber-200">• This URL is very long - some browsers may have issues</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-4">
                <div className="text-blue-100 text-sm">
                  <p className="font-medium mb-1">💡 Pro Tips:</p>
                  <ul className="space-y-1">
                    <li>• Test the link yourself before sharing</li>
                    <li>• The experience works best on mobile devices with audio enabled</li>
                    <li>• The romantic intro plays for 20-30 seconds before revealing the birthday surprise</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="px-6 py-2 text-white/80 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareLinkModal;