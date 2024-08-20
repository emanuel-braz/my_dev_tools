import React, { createContext, useEffect, useState, ReactNode, FC } from 'react';

// Define Note type
export interface Note {
  id: string;
  text: string;
  isEditing: boolean;
  // content: string;
}

// Define the context value type
export interface NoteContextType {
  notes: Note[];
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  inputNote: string;
  setInputNote: (note: string) => void;
  editNote: (note: Note) => void;
}


// Create the context with undefined as default
export const NoteContext = createContext<NoteContextType | undefined>(undefined);

// Define the provider props type
interface NoteProviderProps {
  children: ReactNode;
}

// Create the provider component
export const NoteProvider: FC<NoteProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>(
    JSON.parse(localStorage.getItem('notes') || '[]')
  );
  const [inputNote, setInputNote] = useState<string>('');

  function addNote(note: Note) {
    setNotes(prev => [note, ...prev]);
  }

  function removeNote(id: string) {
    setNotes(notes.filter(note => note.id !== id));
  }

  function editNote(note: Note) {
    const index = notes.findIndex(n => n.id === note.id);
    const tempArray = [...notes];
    if (index !== -1) {
      tempArray[index] = note;
      setNotes(tempArray);
    }
  }

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  return (
    <NoteContext.Provider
      value={{
        notes,
        addNote,
        removeNote,
        inputNote,
        setInputNote,
        editNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
