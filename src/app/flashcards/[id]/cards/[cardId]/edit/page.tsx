'use client';

import { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FlashcardCollection, Flashcard } from '@/types/flashcard';
import { FLASHCARD_CONFIG } from '@/lib/data/flashcard-config';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// LaTeX Quick Templates
const LATEX_TEMPLATES = [
  {
    name: 'Fraction',
    template: '\\frac{x}{y}',
    description: 'Division of x by y'
  },
  {
    name: 'Square Root',
    template: '\\sqrt{x}',
    description: 'Square root of x'
  },
  {
    name: 'Power',
    template: 'x^{n}',
    description: 'x raised to power n'
  },
  {
    name: 'Integral',
    template: '\\int_{a}^{b} x dx',
    description: 'Definite integral from a to b'
  },
  {
    name: 'Sum',
    template: '\\sum_{i=1}^{n} x_i',
    description: 'Sum from i=1 to n'
  },
  {
    name: 'Limit',
    template: '\\lim_{x \\to a} f(x)',
    description: 'Limit as x approaches a'
  }
];

// OCR Hook (reuse from new card page)
function useOCR() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractText = async (file: File): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-=()[]{}^_.,;:!?/\\|~`\'"<> ',
        tessedit_pageseg_mode: '6',
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      return text.trim();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OCR failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { extractText, isLoading, error };
}

export default function EditCardPage({ 
  params 
}: { 
  params: { id: string; cardId: string } 
}) {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [collection, setCollection] = useState<FlashcardCollection | null>(null);
  const [card, setCard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');
  const [activeInput, setActiveInput] = useState<'front' | 'back'>('front');
  
  // OCR state
  const { extractText, isLoading: ocrLoading, error: ocrError } = useOCR();
  const [ocrText, setOcrText] = useState('');
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Refs for textarea cursor position
  const frontTextareaRef = useRef<HTMLTextAreaElement>(null);
  const backTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch collection and card
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch collection
        const collectionResponse = await fetch(`/api/flashcards/${params.id}`);
        if (!collectionResponse.ok) {
          throw new Error('Failed to fetch collection');
        }
        const collectionData = await collectionResponse.json();
        setCollection(collectionData);

        // Fetch card
        const cardResponse = await fetch(`/api/flashcards/${params.id}/cards`);
        if (!cardResponse.ok) {
          throw new Error('Failed to fetch cards');
        }
        const cardsData = await cardResponse.json();
        const foundCard = cardsData.find((c: Flashcard) => c._id.toString() === params.cardId);
        
        if (!foundCard) {
          throw new Error('Card not found');
        }
        
        setCard(foundCard);
        setFront(foundCard.front);
        setBack(foundCard.back);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    if (profile) {
      fetchData();
    }
  }, [params.id, params.cardId, profile]);

  // Enhanced LaTeX rendering
  const renderLatex = (text: string) => {
    try {
      let processed = text;
      
      // Replace display math first ($$...$$ or \[...\])
      processed = processed.replace(/\$\$([^$]+)\$\$/g, (_, tex) => {
        try {
          return katex.renderToString(tex.trim(), { 
            throwOnError: false, 
            displayMode: true 
          });
        } catch {
          return `$$${tex}$$`;
        }
      });
      
      // Replace inline math ($...$)
      processed = processed.replace(/\$([^$\n]+)\$/g, (_, tex) => {
        try {
          return katex.renderToString(tex.trim(), { 
            throwOnError: false, 
            displayMode: false 
          });
        } catch {
          return `$${tex}$`;
        }
      });
      
      // Convert line breaks to proper HTML
      processed = processed.replace(/\n/g, '<br>');
      
      return processed;
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      return text.replace(/\n/g, '<br>');
    }
  };

  // Handle LaTeX rendering
  useEffect(() => {
    try {
      setFrontPreview(renderLatex(front));
      setBackPreview(renderLatex(back));
    } catch (error) {
      console.error('LaTeX rendering error:', error);
    }
  }, [front, back]);

  // Insert text at cursor position
  const insertAtCursor = (text: string, targetInput: 'front' | 'back') => {
    const current = targetInput === 'front' ? front : back;
    const setCurrent = targetInput === 'front' ? setFront : setBack;
    const textarea = targetInput === 'front' ? frontTextareaRef.current : backTextareaRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = current.substring(0, start) + text + current.substring(end);
      setCurrent(newValue);
      
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + text.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      const current = targetInput === 'front' ? front : back;
      const setCurrent = targetInput === 'front' ? setFront : setBack;
      setCurrent(current + text);
    }
  };

  // Insert LaTeX template at cursor position
  const insertTemplate = (template: string, targetInput: 'front' | 'back') => {
    const wrapped = `$${template}$`;
    insertAtCursor(wrapped, targetInput);
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large (max 10MB)');
      return;
    }

    try {
      const extractedText = await extractText(file);
      setOcrText(extractedText);
      setShowOcrModal(true);
    } catch (err) {
      setError('Failed to extract text from image');
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Insert OCR text
  const insertOcrText = () => {
    if (ocrText.trim()) {
      insertAtCursor(ocrText, activeInput);
      setShowOcrModal(false);
      setOcrText('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!card) {
        throw new Error('Card not found');
      }

      const response = await fetch(`/api/flashcards/${params.id}/cards/${params.cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ front, back }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update card');
      }

      router.push(`/flashcards/${params.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update card');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !collection || !card) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Card not found'}</p>
          <button
            onClick={() => router.push(`/flashcards/${params.id}`)}
            className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 
              transition-colors text-sm font-medium"
          >
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  // Get subject and unit info
  const subject = FLASHCARD_CONFIG.SUBJECTS.find(s => s.id === collection.subjectId);
  const unit = subject && collection.unitId
    ? subject.units.find(u => u.id === collection.unitId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-[56px] md:top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="py-4 md:py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-text">Edit Card</h1>
            <div className="flex gap-2 mt-2">
              <span className="text-text-muted">
                {collection.name}
              </span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md">
                {subject?.name}
              </span>
              {unit && (
                <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-md">
                  {unit.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="space-y-6">
                {/* OCR Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-text">📸 Image to Text (OCR)</h3>
                    <div className="text-xs text-text-muted">
                      Inserting into: <span className="font-medium capitalize">{activeInput}</span>
                    </div>
                  </div>
                  
                  {/* Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300
                      ${dragActive 
                        ? 'border-primary bg-primary/5 scale-105' 
                        : 'border-border hover:border-primary/50 hover:bg-surface-hover'
                      }
                      ${ocrLoading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !ocrLoading && fileInputRef.current?.click()}
                  >
                    {ocrLoading ? (
                      <div className="space-y-2">
                        <LoadingSpinner size="sm" />
                        <p className="text-sm text-text-muted">Extracting text from image...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-3xl">📷</div>
                        <p className="text-sm font-medium text-text">
                          Drop an image here or click to upload
                        </p>
                        <p className="text-xs text-text-muted">
                          Supports JPG, PNG, GIF (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                  />

                  {ocrError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                      <p className="text-sm text-red-500">{ocrError}</p>
                    </div>
                  )}
                </div>

                {/* Front */}
                <div className="space-y-2">
                  <label 
                    htmlFor="front"
                    className="block text-sm font-medium text-text"
                  >
                    Front
                  </label>
                  <textarea
                    ref={frontTextareaRef}
                    id="front"
                    value={front}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFront(e.target.value)}
                    onFocus={() => setActiveInput('front')}
                    placeholder="Enter card front (use $ for LaTeX, e.g. $\frac{1}{2}$)"
                    rows={4}
                    required
                    className={`w-full p-3 bg-surface-alt border rounded-md
                      focus:outline-none focus:ring-2 focus:ring-primary/30 
                      focus:border-primary/50 transition-all duration-200
                      ${activeInput === 'front' ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border'}
                    `}
                  />
                </div>

                {/* Back */}
                <div className="space-y-2">
                  <label 
                    htmlFor="back"
                    className="block text-sm font-medium text-text"
                  >
                    Back
                  </label>
                  <textarea
                    ref={backTextareaRef}
                    id="back"
                    value={back}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBack(e.target.value)}
                    onFocus={() => setActiveInput('back')}
                    placeholder="Enter card back (use $ for LaTeX, e.g. $\frac{1}{2}$)"
                    rows={4}
                    required
                    className={`w-full p-3 bg-surface-alt border rounded-md
                      focus:outline-none focus:ring-2 focus:ring-primary/30 
                      focus:border-primary/50 transition-all duration-200
                      ${activeInput === 'back' ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border'}
                    `}
                  />
                </div>

                {/* LaTeX Templates */}
                <div>
                  <h3 className="text-sm font-medium text-text mb-2">
                    LaTeX Quick Templates
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {LATEX_TEMPLATES.map(template => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => insertTemplate(template.template, activeInput)}
                        className="p-2 text-left bg-surface-alt border border-border 
                          rounded-md hover:bg-surface-hover hover:border-primary/30 
                          transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        <div className="text-sm font-medium text-text">
                          {template.name}
                        </div>
                        <div className="text-xs text-text-muted mt-1">
                          {template.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-text mb-2">
                    Front Preview
                  </h3>
                  <div 
                    dangerouslySetInnerHTML={{ __html: frontPreview }}
                    className="p-4 min-h-[120px] bg-surface-alt border border-border 
                      rounded-md prose prose-text max-w-none"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text mb-2">
                    Back Preview
                  </h3>
                  <div 
                    dangerouslySetInnerHTML={{ __html: backPreview }}
                    className="p-4 min-h-[120px] bg-surface-alt border border-border 
                      rounded-md prose prose-text max-w-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="py-2 px-4 bg-primary text-white rounded-md 
                  hover:bg-primary/90 transition-all duration-200 text-sm font-medium
                  transform hover:scale-105 active:scale-95 disabled:opacity-50 
                  disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <LoadingSpinner size="sm" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/flashcards/${params.id}`)}
                className="py-2 px-4 bg-surface-alt text-text rounded-md 
                  hover:bg-surface-hover transition-all duration-200 text-sm font-medium
                  transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* OCR Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text">Extracted Text</h2>
              <p className="text-sm text-text-muted mt-1">
                Review and edit the extracted text, then insert it into your {activeInput}
              </p>
            </div>
            
            <div className="p-6">
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                rows={10}
                className="w-full p-3 bg-surface-alt border border-border rounded-md
                  focus:outline-none focus:ring-2 focus:ring-primary/30 
                  focus:border-primary/50 resize-none"
                placeholder="Extracted text will appear here..."
              />
            </div>

            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowOcrModal(false);
                  setOcrText('');
                }}
                className="py-2 px-4 bg-surface-alt text-text rounded-md 
                  hover:bg-surface-hover transition-all duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={insertOcrText}
                disabled={!ocrText.trim()}
                className="py-2 px-4 bg-primary text-white rounded-md 
                  hover:bg-primary/90 transition-all duration-200 text-sm font-medium
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transform hover:scale-105 active:scale-95"
              >
                Insert into {activeInput}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}