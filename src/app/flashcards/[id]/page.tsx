'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FLASHCARD_CONFIG } from '@/lib/data/flashcard-config';
import { Flashcard, FlashcardCollection } from '@/types/flashcard';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Confidence labels
const CONFIDENCE_LABELS = {
  1: { label: 'Need Practice', color: 'bg-red-500', emoji: '😕' },
  2: { label: 'Getting There', color: 'bg-orange-500', emoji: '🤔' },
  3: { label: 'Know It', color: 'bg-yellow-500', emoji: '😊' },
  4: { label: 'Know It Well', color: 'bg-green-500', emoji: '😃' },
  5: { label: 'Mastered', color: 'bg-emerald-500', emoji: '🎉' }
};

export default function FlashcardCollectionPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [collection, setCollection] = useState<FlashcardCollection | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'view' | 'study'>('view');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'card' | 'collection'; id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch collection and cards
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

        // Fetch cards
        const cardsResponse = await fetch(`/api/flashcards/${params.id}/cards`);
        if (!cardsResponse.ok) {
          throw new Error('Failed to fetch cards');
        }
        const cardsData = await cardsResponse.json();
        setCards(cardsData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    if (profile) {
      fetchData();
    }
  }, [params.id, profile]);

  // Simple LaTeX rendering - exactly like preview pages
  const renderLatex = (text: string) => {
    try {
      const processedText = text.replace(/\$(.*?)\$/g, (_, tex) => {
        return katex.renderToString(tex, { throwOnError: false });
      });
      return processedText;
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      return text;
    }
  };

  // Get subject and unit info
  const subject = collection?.subjectId
    ? FLASHCARD_CONFIG.SUBJECTS.find(s => s.id === collection.subjectId)
    : null;

  const unit = subject && collection?.unitId
    ? subject.units.find(u => u.id === collection.unitId)
    : null;

  // Handle card navigation
  const nextCard = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => 
        prev < cards.length - 1 ? prev + 1 : prev
      );
      setIsAnimating(false);
    }, 250);
  };

  const prevCard = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => 
        prev > 0 ? prev - 1 : prev
      );
      setIsAnimating(false);
    }, 250);
  };

  // Handle card flip
  const flipCard = () => {
    if (isAnimating) return;
    setIsFlipped(!isFlipped);
  };

  // Update card confidence
  const updateConfidence = async (confidence: number) => {
    try {
      const card = cards[currentCardIndex];
      const response = await fetch(
        `/api/flashcards/${params.id}/cards/${card._id}`, 
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ confidence }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update confidence');
      }

      const updatedCard = await response.json();
      setCards(cards.map(c => 
        c._id === updatedCard._id ? updatedCard : c
      ));
      
      // Move to next card after a short delay
      setTimeout(() => {
        nextCard();
      }, 600);
    } catch (error) {
      setError('Failed to update progress');
    }
  };

  // Handle edit card
  const handleEditCard = (cardId: string) => {
    router.push(`/flashcards/${params.id}/cards/${cardId}/edit`);
  };

  // Handle delete actions
  const handleDelete = (type: 'card' | 'collection', id: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleting(true);
    try {
      if (deleteTarget.type === 'collection') {
        const response = await fetch(`/api/flashcards/${params.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete collection');
        }
        
        router.push('/flashcards');
      } else {
        const response = await fetch(`/api/flashcards/${params.id}/cards/${deleteTarget.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete card');
        }
        
        // Remove card from local state
        const updatedCards = cards.filter(c => c._id.toString() !== deleteTarget.id);
        setCards(updatedCards);
        
        // Adjust current card index if needed
        if (currentCardIndex >= updatedCards.length) {
          setCurrentCardIndex(Math.max(0, updatedCards.length - 1));
        }
        
        // Update collection state
        if (collection) {
          setCollection({
            ...collection,
            cardCount: collection.cardCount - 1
          });
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
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

  if (error || !collection) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Collection not found'}</p>
          <button
            onClick={() => router.push('/flashcards')}
            className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 
              transition-all duration-200 text-sm font-medium transform hover:scale-105 active:scale-95"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-[56px] md:top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="py-4 md:py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text">
                  {collection.name}
                </h1>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                    {subject?.name}
                  </span>
                  {unit && (
                    <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full font-medium">
                      {unit.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Mode Toggle */}
                <div className="flex gap-1 bg-surface-alt rounded-lg p-1 border border-border">
                  <button
                    onClick={() => setMode('view')}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200
                      transform hover:scale-105 active:scale-95
                      ${mode === 'view' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-text hover:bg-surface-hover'
                      }`}
                  >
                    📚 View
                  </button>
                  <button
                    onClick={() => {
                      setMode('study');
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                    }}
                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200
                      transform hover:scale-105 active:scale-95
                      ${mode === 'study'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-text hover:bg-surface-hover'
                      }`}
                  >
                    🎯 Study
                  </button>
                </div>

                {/* Delete Collection Button */}
                <button
                  onClick={() => handleDelete('collection', params.id)}
                  className="py-2 px-3 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 
                    transition-all duration-200 text-sm font-medium transform hover:scale-105 active:scale-95
                    border border-red-500/20 hover:border-red-500/30"
                  title="Delete Collection"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {mode === 'view' ? (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-surface-alt rounded-lg border border-border 
                hover:border-primary/30 transition-all duration-200 transform hover:scale-102 hover:shadow-md">
                <div className="text-2xl font-bold text-primary">{cards.length}</div>
                <div className="text-sm text-text-muted">Total Cards</div>
              </div>
              <div className="p-4 bg-surface-alt rounded-lg border border-border
                hover:border-green-500/30 transition-all duration-200 transform hover:scale-102 hover:shadow-md">
                <div className="text-2xl font-bold text-green-500">
                  {cards.filter(c => c.confidence >= 4).length}
                </div>
                <div className="text-sm text-text-muted">Mastered</div>
              </div>
              <div className="p-4 bg-surface-alt rounded-lg border border-border
                hover:border-orange-500/30 transition-all duration-200 transform hover:scale-102 hover:shadow-md">
                <div className="text-2xl font-bold text-orange-500">
                  {cards.filter(c => c.confidence <= 2).length}
                </div>
                <div className="text-sm text-text-muted">Need Practice</div>
              </div>
              <div className="p-4 bg-surface-alt rounded-lg border border-border
                hover:border-blue-500/30 transition-all duration-200 transform hover:scale-102 hover:shadow-md">
                <div className="text-2xl font-bold text-blue-500">
                  {Math.round(cards.reduce((acc, c) => acc + c.confidence, 0) / cards.length * 10) / 10 || 0}
                </div>
                <div className="text-sm text-text-muted">Avg. Confidence</div>
              </div>
            </div>

            {/* Add Card Button */}
            <button
              onClick={() => router.push(`/flashcards/${params.id}/cards/new`)}
              className="py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary/90 
                transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg
                transform hover:scale-105 active:scale-95"
              disabled={cards.length >= FLASHCARD_CONFIG.CARDS_PER_UNIT}
            >
              {cards.length >= FLASHCARD_CONFIG.CARDS_PER_UNIT
                ? `✨ Maximum ${FLASHCARD_CONFIG.CARDS_PER_UNIT} cards reached`
                : '➕ Add New Card'
              }
            </button>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <div
                  key={card._id.toString()}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-6 bg-surface-alt rounded-xl border border-border
                    hover:border-primary/30 hover:shadow-lg transition-all duration-200
                    transform hover:scale-102 hover:-translate-y-1 cursor-pointer
                    active:scale-98"
                    onClick={() => {
                      setMode('study');
                      setCurrentCardIndex(index);
                      setIsFlipped(false);
                    }}
                  >
                    {/* Confidence Badge */}
                    <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center 
                      justify-center text-white text-sm font-bold ${CONFIDENCE_LABELS[card.confidence as keyof typeof CONFIDENCE_LABELS].color}
                      transform group-hover:scale-110 transition-all duration-200`}>
                      {card.confidence}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCard(card._id.toString());
                        }}
                        className="w-6 h-6 bg-blue-500/10 text-blue-500 rounded-full
                          hover:bg-blue-500/20 transform hover:scale-110 active:scale-95 text-xs
                          border border-blue-500/20 hover:border-blue-500/30"
                        title="Edit Card"
                      >
                        ✎
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('card', card._id.toString());
                        }}
                        className="w-6 h-6 bg-red-500/10 text-red-500 rounded-full
                          hover:bg-red-500/20 transform hover:scale-110 active:scale-95 text-xs
                          border border-red-500/20 hover:border-red-500/30"
                        title="Delete Card"
                      >
                        ×
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs text-text-muted uppercase tracking-wide font-medium">Front</div>
                        <div 
                          dangerouslySetInnerHTML={{ __html: renderLatex(card.front) }}
                          className="font-medium text-text"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-text-muted uppercase tracking-wide font-medium">Back</div>
                        <div 
                          dangerouslySetInnerHTML={{ __html: renderLatex(card.back) }}
                          className="text-text-muted"
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                      <div className="text-xs text-text-muted font-medium">
                        {CONFIDENCE_LABELS[card.confidence as keyof typeof CONFIDENCE_LABELS].label}
                      </div>
                      <div className="text-xs text-text-muted">
                        Reviewed {card.reviewCount} times
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {cards.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-xl text-text-muted mb-6">No cards in this collection</p>
                <button
                  onClick={() => router.push(`/flashcards/${params.id}/cards/new`)}
                  className="py-3 px-6 bg-primary text-white rounded-lg hover:bg-primary/90 
                    transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg
                    transform hover:scale-105 active:scale-95"
                >
                  ➕ Add Your First Card
                </button>
              </div>
            ) : currentCard ? (
              <div className="space-y-8">
                {/* Progress Bar */}
                <div className="space-y-2 animate-slide-down">
                  <div className="flex justify-between text-sm text-text-muted">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold">{currentCardIndex + 1} / {cards.length}</span>
                  </div>
                  <div className="h-3 bg-surface-alt rounded-full overflow-hidden border border-border shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary 
                        transition-all duration-500 ease-out rounded-full"
                      style={{ 
                        width: `${((currentCardIndex + 1) / cards.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Card Container */}
                <div className="relative animate-fade-in">
                  {/* Card */}
                  <div 
                    className={`relative w-full h-80 md:h-96 cursor-pointer transition-all duration-500 
                      transform-gpu preserve-3d ${isFlipped ? 'rotate-y-180' : ''} 
                      ${isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}
                      hover:scale-102 active:scale-98`}
                    onClick={flipCard}
                    style={{ perspective: '1000px' }}
                  >
                    {/* Front Side */}
                    <div className="absolute inset-0 backface-hidden">
                      <div className="h-full p-8 flex flex-col items-center justify-center 
                        bg-surface-alt rounded-2xl border-2 border-primary/20 
                        shadow-xl hover:shadow-2xl transition-all duration-200">
                        <div className="text-sm text-primary mb-4 font-bold uppercase tracking-wide">
                          Question
                        </div>
                        <div className="text-center text-lg md:text-xl font-medium text-text 
                          flex-1 flex items-center justify-center w-full p-4">
                          <div 
                            dangerouslySetInnerHTML={{ __html: renderLatex(currentCard.front) }}
                          />
                        </div>
                        <div className="mt-6 text-xs text-primary/70 font-medium">
                          Click to reveal answer
                        </div>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div className="absolute inset-0 rotate-y-180 backface-hidden">
                      <div className="h-full p-8 flex flex-col items-center justify-center 
                        bg-surface-alt rounded-2xl border-2 border-secondary/20 
                        shadow-xl hover:shadow-2xl transition-all duration-200">
                        <div className="text-sm text-secondary mb-4 font-bold uppercase tracking-wide">
                          Answer
                        </div>
                        <div className="text-center text-lg md:text-xl text-text 
                          flex-1 flex items-center justify-center w-full p-4">
                          <div 
                            dangerouslySetInnerHTML={{ __html: renderLatex(currentCard.back) }}
                          />
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${CONFIDENCE_LABELS[currentCard.confidence as keyof typeof CONFIDENCE_LABELS].color}`} />
                          <div className="text-xs text-secondary font-medium">
                            Current: {CONFIDENCE_LABELS[currentCard.confidence as keyof typeof CONFIDENCE_LABELS].label}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Navigation */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-16 hidden md:block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevCard();
                      }}
                      disabled={currentCardIndex === 0 || isAnimating}
                      className="w-12 h-12 bg-surface-alt rounded-full border border-border
                        shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center
                        text-text font-bold"
                    >
                      ←
                    </button>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 -right-16 hidden md:block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextCard();
                      }}
                      disabled={currentCardIndex === cards.length - 1 || isAnimating}
                      className="w-12 h-12 bg-surface-alt rounded-full border border-border
                        shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center
                        text-text font-bold"
                    >
                      →
                    </button>
                  </div>

                  {/* Edit and Delete Card Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCard(currentCard._id.toString());
                      }}
                      className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-full
                        transition-all duration-200 hover:bg-blue-500/20 transform hover:scale-110 active:scale-95
                        border border-blue-500/20 hover:border-blue-500/30 text-sm font-bold"
                      title="Edit Card"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete('card', currentCard._id.toString());
                      }}
                      className="w-8 h-8 bg-red-500/10 text-red-500 rounded-full
                        transition-all duration-200 hover:bg-red-500/20 transform hover:scale-110 active:scale-95
                        border border-red-500/20 hover:border-red-500/30 text-sm font-bold"
                      title="Delete Card"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex justify-between md:hidden gap-4">
                  <button
                    onClick={prevCard}
                    disabled={currentCardIndex === 0 || isAnimating}
                    className="py-3 px-6 bg-surface-alt text-text rounded-lg border border-border
                      hover:bg-surface-hover transition-all duration-200 disabled:opacity-50 
                      disabled:cursor-not-allowed transform hover:scale-105 active:scale-95
                      font-medium"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={nextCard}
                    disabled={currentCardIndex === cards.length - 1 || isAnimating}
                    className="py-3 px-6 bg-surface-alt text-text rounded-lg border border-border
                      hover:bg-surface-hover transition-all duration-200 disabled:opacity-50 
                      disabled:cursor-not-allowed transform hover:scale-105 active:scale-95
                      font-medium"
                  >
                    Next →
                  </button>
                </div>

                {/* Confidence Rating */}
                {isFlipped && (
                  <div className="space-y-4 animate-slide-up">
                    <div className="text-center">
                      <div className="text-lg font-bold text-text mb-2">
                        How well do you know this? 🤔
                      </div>
                      <div className="text-sm text-text-muted">
                        Rate your confidence to improve your study plan
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const config = CONFIDENCE_LABELS[rating as keyof typeof CONFIDENCE_LABELS];
                        return (
                          <button
                            key={rating}
                            onClick={() => updateConfidence(rating)}
                            className={`p-4 rounded-xl text-sm font-medium transition-all duration-200
                              transform hover:scale-105 active:scale-95 hover:shadow-lg border-2
                              ${currentCard.confidence === rating
                                ? `${config.color} text-white border-transparent shadow-lg scale-102`
                                : 'bg-surface-alt text-text border-border hover:border-primary/30'
                              }`}
                          >
                            <div className="text-2xl mb-1">{config.emoji}</div>
                            <div className="font-bold">{rating}</div>
                            <div className="text-xs opacity-90">{config.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Study Tips */}
                <div className="p-4 bg-surface-alt rounded-lg border border-border 
                  hover:border-primary/30 transition-all duration-200 transform hover:scale-102
                  animate-slide-up">
                  <div className="text-sm text-text">
                    <span className="text-primary font-bold">💡 Study Tip:</span> Click the card to flip it, then rate your confidence. 
                    Cards you struggle with will appear more frequently in future sessions.
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-bold text-text mb-2">
                Delete {deleteTarget.type === 'collection' ? 'Collection' : 'Card'}?
              </h2>
              <p className="text-text-muted text-sm mb-6">
                {deleteTarget.type === 'collection' 
                  ? 'This will permanently delete the collection and all its cards. This action cannot be undone.'
                  : 'This will permanently delete this card. This action cannot be undone.'
                }
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  }}
                  disabled={deleting}
                  className="py-2 px-4 bg-surface-alt text-text rounded-md 
                    hover:bg-surface-hover transition-all duration-200 text-sm font-medium
                    disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="py-2 px-4 bg-red-500 text-white rounded-md 
                    hover:bg-red-600 transition-all duration-200 text-sm font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleting && <LoadingSpinner size="sm" />}
                  Delete {deleteTarget.type === 'collection' ? 'Collection' : 'Card'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .scale-102 {
          transform: scale(1.02);
        }
        .scale-98 {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}