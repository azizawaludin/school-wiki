/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import type { AsciiArtData } from '../services/geminiService';

interface AsciiArtDisplayProps {
  artData: AsciiArtData | null;
  topic: string;
}

const AsciiArtDisplay: React.FC<AsciiArtDisplayProps> = ({ artData, topic }) => {
  const [visibleArt, setVisibleArt] = useState<string>('*');
  const [visibleText, setVisibleText] = useState<string>('');
  const [isStreamingArt, setIsStreamingArt] = useState<boolean>(false);
  const [isStreamingText, setIsStreamingText] = useState<boolean>(false);

  useEffect(() => {
    let artIntervalId: number;
    let textIntervalId: number;

    const cleanup = () => {
      window.clearInterval(artIntervalId);
      window.clearInterval(textIntervalId);
    };

    if (artData) {
      setVisibleArt('');
      setVisibleText('');
      setIsStreamingArt(true);
      setIsStreamingText(false);

      const fullArt = artData.art;
      let artIndex = 0;
      
      artIntervalId = window.setInterval(() => {
        const char = fullArt[artIndex];
        if (char !== undefined) {
          setVisibleArt(prev => prev + char);
          artIndex++;
        } else {
          window.clearInterval(artIntervalId);
          setIsStreamingArt(false);

          if (artData.text) {
            setIsStreamingText(true);
            const fullText = artData.text;
            let textIndex = 0;

            textIntervalId = window.setInterval(() => {
              const textChar = fullText[textIndex];
              if (textChar !== undefined) {
                setVisibleText(prev => prev + textChar);
                textIndex++;
              } else {
                window.clearInterval(textIntervalId);
                setIsStreamingText(false);
              }
            }, 15); // Slower typing for text to be more readable
          }
        }
      }, 5);

    } else {
      setVisibleArt('*');
      setVisibleText('');
      setIsStreamingArt(false);
      setIsStreamingText(false);
    }
    
    return cleanup;
  }, [artData]);

  const accessibilityLabel = `ASCII art for ${topic}`;

  return (
    <div>
      <pre className="ascii-art" aria-label={accessibilityLabel}>
        {visibleArt}
        {isStreamingArt && <span className="blinking-cursor">|</span>}
      </pre>
      {(visibleText || isStreamingText) && (
        <p className="art-explanation">
          {visibleText}
          {isStreamingText && <span className="blinking-cursor">|</span>}
        </p>
      )}
    </div>
  );
};

export default AsciiArtDisplay;