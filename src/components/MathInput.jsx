import React, { useRef, useEffect } from 'react';
import 'mathlive'; // Import MathLive library

// Configure MathLive to load fonts and sounds from a CDN to avoid local serving issues
window.MathfieldElement.fontsDirectory = 'https://unpkg.com/mathlive@0.98.0/dist/fonts';
window.MathfieldElement.soundsDirectory = 'https://unpkg.com/mathlive@0.98.0/dist/sounds';

export default function MathInput({ value, onChange, className, ...props }) {
  const mathfieldRef = useRef(null);

  useEffect(() => {
    const mathfield = mathfieldRef.current;

    if (mathfield) {
      // Set initial value
      if (value !== undefined && value !== mathfield.getValue()) {
        mathfield.setValue(value, { suppressChangeNotifications: true });
      }

      // Event listener for changes
      const handleInput = () => {
        if (onChange) {
          onChange(mathfield.getValue());
        }
      };

      mathfield.addEventListener('input', handleInput);

      // Cleanup
      return () => {
        mathfield.removeEventListener('input', handleInput);
      };
    }
  }, [value, onChange]);

  return (
    <math-field
      ref={mathfieldRef}
      className={`mathlive-input ${className || ''}`}
      // Enable the virtual keyboard toggle
      math-virtual-keyboard-policy="manual" 
      // Allow smart mode which can help with text entry interpretation
      smart-mode="on"
      {...props}
    ></math-field>
  );
}
