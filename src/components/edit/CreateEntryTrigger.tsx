'use client';

import { useState } from 'react';
import { CreateEntryButton } from './CreateEntryButton';
import { CreateEntryModal } from './CreateEntryModal';

interface CreateEntryTriggerProps {
  entityType: string;
  defaultValues?: Record<string, string>;
  label?: string;
}

export function CreateEntryTrigger({ entityType, defaultValues, label }: CreateEntryTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CreateEntryButton onClick={() => setOpen(true)} label={label} />
      <CreateEntryModal
        open={open}
        onClose={() => setOpen(false)}
        entityType={entityType}
        defaultValues={defaultValues}
      />
    </>
  );
}
