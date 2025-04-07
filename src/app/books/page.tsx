"use client";

import { useState } from "react";
import SubjectFilter from "@/components/books/SubjectFilter";
import BooksGrid from "@/components/books/BooksGrid";
import booksData from "@/lib/data/books.json";

const allSubjects = Array.from(
  new Set(booksData.books.map((book) => book.subject))
).filter(Boolean) as string[];

export default function BooksPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredBooks = selectedSubject
    ? booksData.books.filter((book) => book.subject === selectedSubject)
    : booksData.books;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Books</h1>
        <SubjectFilter
          subjects={allSubjects}
          selectedSubject={selectedSubject}
          onChange={setSelectedSubject}
        />
      </div>

      <BooksGrid books={filteredBooks} />
    </div>
  );
}
