
import { ChangeEvent, FormEvent, useContext } from 'react';
import { NoteContext } from '../contexts/NoteContext';
import { nanoid } from 'nanoid';
import { NoteContextType } from "../contexts/NoteContext";
import React from 'react';
interface FormProps {
  children?: React.ReactNode;
}

export function Form(props: FormProps) {

  const { addNote, inputNote, setInputNote, onFilter, filterText } = useContext(NoteContext) as NoteContextType;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setInputNote(event.target.value);
  }
  
  function handleFilterNotes(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    onFilter(text);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addNote({ id: nanoid(), text: inputNote, isEditing: false });
    setInputNote('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ position: 'relative', width: '100%' }}>
    <input
      type="text"
      value={filterText}
      onChange={handleFilterNotes}
      style={styles.search}
      placeholder=" Search..."
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-51%)',
        width: '18px',
        height: '18px',
        pointerEvents: 'none', // Prevents the icon from blocking input interactions
        color: '#999',
      }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>

    <hr style={{ margin: '4px 0', border: '0', borderTop: '1px solid #656565' }} />
  </div>
      
      <div style={styles.flex}>
        <input type='text' value={inputNote} onChange={handleChange} required style={styles.input} />
        {props.children}
      </div>
      
    </form>
  );
}

const styles = {
  flex: {
    display: 'flex',
  },
  search: {
    flex: 1,
    borderRadius: '2px',
    paddingRight: '0',
    marginTop: '6px',
  },
  input: {
    flex: 1,
    marginRight: '6px',
    borderRadius: '2px',
  }
};
