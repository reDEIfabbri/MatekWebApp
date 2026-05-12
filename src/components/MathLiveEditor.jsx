import React, { useRef, useEffect, useState } from 'react';
import 'mathlive';

const MathLiveEditor = ({ initialValue = '', onChange, readOnly = false }) => {
  const mfRef = useRef(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const mf = mfRef.current;
    if (mf) {
      // Set the initial value
      mf.value = initialValue;
      if (readOnly) {
          mf.readOnly = true;
      }

      // Listen for changes
      const handleInput = (ev) => {
        setValue(mf.value);
        if (onChange) {
          onChange(mf.value);
        }
      };
      
      mf.addEventListener('input', handleInput);

      return () => {
          mf.removeEventListener('input', handleInput);
      }
    }
  }, []); // Only run once on mount

  // Allow external updates to the value
  useEffect(() => {
     if (mfRef.current && initialValue !== value) {
         mfRef.current.value = initialValue;
         setValue(initialValue);
     }
  }, [initialValue]);

  return (
    <div className={`w-full p-2 border rounded-md shadow-sm bg-white ${readOnly ? 'border-transparent shadow-none pointer-events-none' : 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'}`}>
      <math-field 
        ref={mfRef} 
        style={{ 
            width: '100%', 
            fontSize: '1.25rem',
            padding: '8px',
            backgroundColor: 'transparent',
            outline: 'none'
        }}
      >
      </math-field>
    </div>
  );
};

export default MathLiveEditor;