
import React from 'react';

export function Button() {
  return (
    <button style={styles.iconButton}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}

const styles = {
  iconButton: {
    width: '28px',
    height: '28px',
    borderRadius: '2px',
    border: 'none',
    padding: '2px',
  }
};