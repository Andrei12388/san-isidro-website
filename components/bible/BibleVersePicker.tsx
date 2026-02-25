import React, { useState, useEffect } from "react";
import VerseDisplay from "./VerseDisplay";

// KJV book names + chapter counts
const bibleBooks = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "Acts", chapters: 28 },
  // ... add more books as needed
];

const BibleVersePickerNoAPI: React.FC = () => {
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState(1);
  const [verseStart, setVerseStart] = useState(1);
  const [verseEnd, setVerseEnd] = useState(1);
  const [maxChapters, setMaxChapters] = useState(21);
  const [maxVerses, setMaxVerses] = useState(25);
  const [verseData, setVerseData] = useState<any[]>([]);
  const [reference, setReference] = useState("");

  // Update max chapters when book changes
  useEffect(() => {
    const selectedBook = bibleBooks.find(b => b.name === book);
    if (selectedBook) setMaxChapters(selectedBook.chapters);
    setChapter(1);
    setVerseStart(1);
    setVerseEnd(1);
  }, [book]);

  // Fetch chapter to determine max verses
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(`https://bible-api.com/${book}+${chapter}`);
        if (!response.ok) throw new Error("Failed to fetch chapter");
        const data = await response.json();
        if (data.verses && data.verses.length) {
          setMaxVerses(data.verses.length);
          setVerseStart(1);
          setVerseEnd(Math.min(5, data.verses.length)); // default range 1–5
        }
      } catch (error) {
        console.error(error);
        setVerseData([]);
      }
    };
    fetchChapter();
  }, [book, chapter]);

  // Fetch verse range whenever selection changes
  useEffect(() => {
    const fetchVerseRange = async () => {
      try {
        const response = await fetch(`https://bible-api.com/${book}+${chapter}:${verseStart}-${verseEnd}`);
        if (!response.ok) throw new Error("Failed to fetch verse range");
        const data = await response.json();
        setVerseData(data.verses);
        setReference(data.reference);
      } catch (error) {
        console.error(error);
        setVerseData([]);
      }
    };
    fetchVerseRange();
  }, [book, chapter, verseStart, verseEnd]);

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>Bible Verse Picker</h2>

      <label>
        Book:
        <select value={book} onChange={e => setBook(e.target.value)}>
          {bibleBooks.map(b => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </select>
      </label>

      <label>
        Chapter:
        <select value={chapter} onChange={e => setChapter(Number(e.target.value))}>
          {Array.from({ length: maxChapters }, (_, i) => i + 1).map(ch => (
            <option key={ch} value={ch}>{ch}</option>
          ))}
        </select>
      </label>

      <label>
        Verse Start:
        <select value={verseStart} onChange={e => setVerseStart(Number(e.target.value))}>
          {Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </label>

      <label>
        Verse End:
        <select value={verseEnd} onChange={e => setVerseEnd(Number(e.target.value))}>
          {Array.from({ length: maxVerses - verseStart + 1 }, (_, i) => i + verseStart).map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </label>

      <VerseDisplay verseData={verseData} reference={reference} />
    </div>
  );
};

export default BibleVersePickerNoAPI;