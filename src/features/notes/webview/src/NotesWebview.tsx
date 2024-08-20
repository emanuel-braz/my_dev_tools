import React from 'react'
import { Button } from './components/Button'
import { Note } from './components/Note'
import { Form } from './components/Form'

import { NoteProvider } from './contexts/NoteContext'

function NotesWebview() {
  return (
    <NoteProvider>
      <Form>
        <Button />
      </Form>
      <Note />
    </NoteProvider>
  )
}

export default NotesWebview;
