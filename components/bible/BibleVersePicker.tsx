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
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },

  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];

const BibleVersePickerNoAPI: React.FC = () => {
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState(1);
  const [verseStart, setVerseStart] = useState<number | null>(1);
  const [verseEnd, setVerseEnd] = useState<number | null>(1);
  const [maxChapters, setMaxChapters] = useState(21);
  const [maxVerses, setMaxVerses] = useState(25);
  const [verseData, setVerseData] = useState<any[]>([]);
  const [reference, setReference] = useState("");

  // Update max chapters when book changes
  useEffect(() => {
    const selectedBook = bibleBooks.find((b) => b.name === book);
    if (selectedBook) setMaxChapters(selectedBook.chapters);
    setChapter(1);

    setVerseStart(1);
    setVerseEnd(1);
  }, [book]);

  // Fetch chapter to determine max verses
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(
          `https://bible-api.com/${book}+${chapter}`,
        );
        if (!response.ok) throw new Error("Failed to fetch chapter");
        const data = await response.json();
        if (data.verses && data.verses.length) {
          setMaxVerses(data.verses.length);
          setVerseStart(1);
          setVerseEnd(1);
        }
      } catch (error) {
        console.error(error);
        setVerseData([]);
      }
    };
    fetchChapter();
  }, [book, chapter]);

  useEffect(() => {
    if (!verseStart) return;

    // if end is smaller OR not set → sync it
    if (!verseEnd || verseEnd < verseStart) {
      setVerseEnd(verseStart);
    }
  }, [verseStart]);

  // Fetch verse range whenever selection changes
  useEffect(() => {
    if (!verseStart || !verseEnd || verseStart > verseEnd) return;

    const fetchVerseRange = async () => {
      try {
        const response = await fetch(
          `https://bible-api.com/${book}+${chapter}:${verseStart}-${verseEnd}`,
        );

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
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <label>
            <span className="font-semibold">Book: </span>
            <select value={book} onChange={(e) => setBook(e.target.value)}>
              {bibleBooks.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="font-semibold">Chapter: </span>
            <select
              value={chapter}
              onChange={(e) => setChapter(Number(e.target.value))}
            >
              {Array.from({ length: maxChapters }, (_, i) => i + 1).map(
                (ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <label>
            <span className="font-semibold">Verse Start: </span>
            <select
              value={verseStart || ""}
              onChange={(e) => setVerseStart(Number(e.target.value))}
            >
              {Array.from({ length: maxVerses }, (_, i) => i + 1).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="font-semibold">Verse End: </span>
            <select
              value={verseEnd || ""}
              onChange={(e) => setVerseEnd(Number(e.target.value))}
            >
              {Array.from(
                { length: maxVerses - (verseStart || 0) + 1 },
                (_, i) => i + (verseStart || 1),
              ).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <VerseDisplay verseData={verseData} reference={reference} />
    </div>
  );
};

export default BibleVersePickerNoAPI;
