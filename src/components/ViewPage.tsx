import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { retrieveBirthdayData } from '../utils/dataStorage';
import IntroSlideshow from './IntroSlideshow';
import BirthdaySequence from './BirthdaySequence';

interface Payload {
  name: string;
  age: string;
  message: string;
  images: Array<{ name: string; dataUrl: string; id?: string }>;
  audio?: { name: string; dataUrl: string } | null;
  createdAt: string;
}

type ViewState = 'loading' | 'error' | 'intro' | 'birthday' | 'completed';

const ViewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { shortId } = useParams<{ shortId: string }>();
  const [state, setState] = useState<ViewState>('loading');
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadBirthdayData = async () => {
      try {
        let data: Payload | null = null;
        
        // Check if we have a shortId from the URL path
        if (shortId) {
          data = await retrieveBirthdayData(shortId);
        } else {
          // Fallback: check for old-style encoded data in query params
          const encodedData = searchParams.get('data');
          if (encodedData) {
            // Try to decode using the old method for backward compatibility
            try {
              const { decodePayload } = await import('../utils/compression');
              data = decodePayload(encodedData);
            } catch (decodeError) {
              console.warn('Old-style decoding failed:', decodeError);
            }
          }
        }

        if (!data) {
          setError('No birthday surprise found. The link may be invalid or expired.');
          setState('error');
          return;
        }

        setPayload(data);
        setState('intro');
      } catch (err) {
        console.error('Failed to load birthday data:', err);
        setError(`Failed to load birthday surprise. Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setState('error');
      }
    };

    loadBirthdayData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortId]);

  const handleIntroComplete = () => {
    setState('birthday');
  };

  const handleBirthdayComplete = () => {
    setState('completed');
  };

  const handleReplay = () => {
    setState('intro');
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-white text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>Loading your magical surprise...</p>
        </motion.div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center p-4">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-playfair font-bold text-white mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-red-200 mb-6">{error}</p>
          <button
            onClick={() => (window.location.hash = '#/')}
            className="btn-romantic text-white font-semibold py-3 px-6 rounded-lg"
          >
            Create New Surprise
          </button>
        </motion.div>
      </div>
    );
  }

  if (!payload) return null;

  if (state === 'intro') {
    return (
      <IntroSlideshow
        images={payload.images}
        onComplete={handleIntroComplete}
        name={payload.name}
      />
    );
  }

  if (state === 'birthday' || state === 'completed') {
    return (
      <BirthdaySequence
        name={payload.name}
        age={payload.age}
        message={payload.message}
        images={payload.images}
        audio={payload.audio}
        onComplete={handleBirthdayComplete}
        onReplay={handleReplay}
        isCompleted={state === 'completed'}
      />
    );
  }

  return null;
};

export default ViewPage;