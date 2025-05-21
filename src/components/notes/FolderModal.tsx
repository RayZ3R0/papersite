'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Resource } from '@/types/note';
import NoteCard from './NoteCard';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Resource;
  unitName?: string;
  topicName?: string;
}

export default function FolderModal({
  isOpen,
  onClose,
  folder,
  unitName,
  topicName
}: FolderModalProps) {
  if (!folder.items || folder.items.length === 0) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-lg bg-background p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-text"
                  >
                    {folder.title}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-text-muted hover:text-text focus:outline-none"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                {unitName && (
                  <div className="mb-2 text-sm text-text-muted">
                    <span>Unit: {unitName}</span>
                    {topicName && <span> • Topic: {topicName}</span>}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folder.items.map(resource => (
                    <div key={resource.id}>
                      <NoteCard
                        resource={resource}
                        unitName={unitName}
                        topicName={topicName}
                      />
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}