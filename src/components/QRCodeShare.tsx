import React, { useState, useEffect } from 'react';
import { Share2, QrCode, Copy, Check } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { GeneratedStory } from '../types';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface QRCodeShareProps {
  story: GeneratedStory;
}

export const QRCodeShare: React.FC<QRCodeShareProps> = ({ story }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { preferences } = useGlimmerStore();

  useEffect(() => {
    generateShareUrl();
  }, [story]);

  const generateShareUrl = async () => {
    try {
      // Only encode the story ID to keep URL short
      const baseUrl = window.location.origin + window.location.pathname;
      const fullShareUrl = `${baseUrl}?storyId=${story.id}`;
      
      setShareUrl(fullShareUrl);

      // Generate QR code
      const qrUrl = await QRCodeLib.toDataURL(fullShareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#8b5cf6',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Provide feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Check out this magical story: "${story.title}"`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-4">
      {/* Share Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowQR(!showQR)}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-xl
            bg-gradient-to-r from-purple-500 to-purple-600
            hover:from-purple-600 hover:to-purple-700
            text-white font-semibold shadow-lg
            transition-all duration-200 hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-purple-400
            ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-sm'}
          `}
          aria-label="Show QR code for sharing"
        >
          <QrCode className="w-4 h-4" />
          <span>QR Code</span>
        </button>

        <button
          onClick={handleNativeShare}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-xl
            bg-gradient-to-r from-blue-500 to-blue-600
            hover:from-blue-600 hover:to-blue-700
            text-white font-semibold shadow-lg
            transition-all duration-200 hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-blue-400
            ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-sm'}
          `}
          aria-label="Share story"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        <button
          onClick={copyToClipboard}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-xl
            ${copied 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
            }
            text-white font-semibold shadow-lg
            transition-all duration-200 hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-gray-400
            ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-sm'}
          `}
          aria-label={copied ? 'Link copied!' : 'Copy share link'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* QR Code Display */}
      {showQR && qrCodeUrl && (
        <div className={`
          bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700
          animate-fade-in shadow-lg
        `}>
          <div className="text-center">
            <h4 className={`font-bold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
              Scan to Share Story
            </h4>
            <div className="inline-block p-4 bg-white rounded-xl shadow-md">
              <img 
                src={qrCodeUrl} 
                alt="QR code for story sharing"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className={`text-gray-600 dark:text-gray-400 mt-4 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
              Anyone can scan this code to view and play your story!
            </p>
          </div>
        </div>
      )}

      {/* Share URL Display */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <p className={`text-gray-600 dark:text-gray-400 mb-2 font-medium ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
          Share Link:
        </p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className={`
              flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
              rounded-lg text-gray-700 dark:text-gray-300 font-mono
              focus:outline-none focus:ring-2 focus:ring-purple-500
              ${preferences.accessibility.largeText ? 'text-base' : 'text-xs'}
            `}
          />
        </div>
      </div>
    </div>
  );
};