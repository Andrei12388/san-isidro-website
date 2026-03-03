import { copyToClipboard } from "@/lib/utils";
import React from "react";
import { FloatingMessage, showFloatingMessage } from "../notifyClick";
import { IconCopy } from "@tabler/icons-react";

interface VerseDisplayProps {
  verseData: any[];
  reference: string;
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({
  verseData,
  reference,
}) => {
  if (!verseData || verseData.length === 0) return <p>Loading verse(s)...</p>;

  const handleClickNotify = (e: React.MouseEvent) => {
    // e.clientX and e.clientY are the mouse coordinates
    showFloatingMessage("Copied!", e.clientX, e.clientY);
  };

  return (
    <div className="border-t" style={{ marginTop: 20, paddingTop: 10 }}>
      <FloatingMessage />
      <div className="flex flex-row gap-2">
        <p>
          <strong>{reference}</strong>
        </p>
        <IconCopy
          size={20}
          className="cursor-pointer"
          onClick={(e) =>
            copyToClipboard(
              `${reference} — ${verseData.map((v) => v.text).join("\n")}`,
              () => handleClickNotify(e),
            )
          }
        />
      </div>
      <div className="flex flex-row gap-2">
        <div>
          {verseData.map((v) => (
            <p key={v.verse}>{v.text}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerseDisplay;
