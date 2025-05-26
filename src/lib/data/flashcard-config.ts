export const FLASHCARD_CONFIG = {
  CARDS_PER_UNIT: 20,
  SUBJECTS: [
    {
      id: 'chemistry',
      name: 'Chemistry',
      units: Array.from({ length: 6 }, (_, i) => ({
        id: `chem-unit-${i + 1}`,
        name: `Unit ${i + 1}`
      }))
    },
    {
      id: 'physics',
      name: 'Physics',
      units: Array.from({ length: 6 }, (_, i) => ({
        id: `phys-unit-${i + 1}`,
        name: `Unit ${i + 1}`
      }))
    },
    {
      id: 'biology',
      name: 'Biology',
      units: Array.from({ length: 6 }, (_, i) => ({
        id: `bio-unit-${i + 1}`,
        name: `Unit ${i + 1}`
      }))
    }
  ]
} as const;