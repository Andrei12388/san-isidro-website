import React from "react";

interface VerseDisplayProps {
  verseData: any[];
  reference: string;
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({ verseData, reference }) => {
  if (!verseData || verseData.length === 0) return <p>Loading verse(s)...</p>;

  return (
    <div style={{ marginTop: 20 }}>
      <p><strong>{reference}</strong></p>
      {verseData.map(v => (
        <p key={v.verse}>{v.text}</p>
      ))}
    </div>
  );
};

export default VerseDisplay;