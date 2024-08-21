import React, { createContext, useEffect, useState, ReactNode, FC } from 'react';

export interface Note {
  id: string;
  text: string;
  isEditing: boolean;
  // content: string;
}

export interface NoteContextType {
  notes: Note[];
  filteredNotes: Note[];
  inputNote: string;
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  setInputNote: (note: string) => void;
  editNote: (note: Note) => void;
  onFilter: (filterText: string) => void;
  filterText: string;
}

interface NoteProviderProps {
  children: ReactNode;
}

export const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: FC<NoteProviderProps> = ({ children }) => {
  
  const [notes, setNotes] = useState<Note[]>(
    JSON.parse(localStorage.getItem('notes') || '[]')
  );
  
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [filterText, setFilterText] = React.useState('');

  const [inputNote, setInputNote] = useState<string>('');

  function addNote(note: Note) {
    if (!note.text) return;
    
    setNotes(prev => [note, ...prev]);
    onFilter('');
  }

  function removeNote(id: string) {
    setNotes(notes.filter(note => note.id !== id));
    setFilteredNotes(filteredNotes.filter(note => note.id !== id));
  }

  function editNote(note: Note) {
    const index = notes.findIndex(n => n.id === note.id);
    const tempArray = [...notes];
    if (index !== -1) {
      tempArray[index] = note;
      setNotes(tempArray);
    }
  }

  function onFilter(filterText: string) {
    const filteredNotes = notes.filter(note => note.text.includes(filterText));
    setFilteredNotes(filteredNotes);
    setFilterText(filterText);
  }

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
    const isEditing = notes.some(note => note.isEditing);
    if (!isEditing) {
      onFilter(filterText);
    }
  }, [notes]);

  useEffect(() => {
    onFilter(filterText);
  }, []);

  return (
    <NoteContext.Provider
      value={{
        notes,
        addNote,
        removeNote,
        inputNote,
        setInputNote,
        editNote,
        onFilter,
        filterText,
        filteredNotes,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
