
import { ChangeEvent, FormEvent, useContext } from 'react';
import { NoteContext } from '../contexts/NoteContext';
import { nanoid } from 'nanoid';
// import styles from '../styles/components/Form.module.css';
import { NoteContextType } from "../contexts/NoteContext";
import React from 'react';

// Define types for the component props
interface FormProps {
  children?: React.ReactNode;
}

export function Form(props: FormProps) {
  const { addNote, inputNote, setInputNote } = useContext(NoteContext) as NoteContextType;

  // Type the event parameter for handleChange
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setInputNote(event.target.value);
  }

  // Type the event parameter for handleSubmit
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addNote({ id: nanoid(), text: inputNote, isEditing: false });
    setInputNote('');
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input type='text' value={inputNote} onChange={handleChange} required style={styles.input} />
      {props.children}
    </form>
  );
}

const styles = {
  form: {
    display: 'flex',
  },
  input: {
    flex: 1,
    marginRight: '6px',
    borderRadius: '2px',
  }
};