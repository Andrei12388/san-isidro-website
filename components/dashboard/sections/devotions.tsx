"use client";

import { useEffect, useState } from "react";
import styles from "./devotions.module.css";
import { DEVOTIONS_DATA } from "./devotions.data";
import { Input } from "@/components/ui/input";
import { IconBalloon, IconHeart, IconPlus } from "@tabler/icons-react";
import BibleVersePickerNoAPI from "@/components/bible/BibleVersePicker";
import { Button } from "@/components/ui/button";
import { FaComment, FaCommentDots, FaFacebookMessenger } from "react-icons/fa";
import { add } from "date-fns";

export interface DevotionItem {
  id: number;
  title: string;
  image: string;
  message: string;
  verse: string;
  heart: number;
  heartActive: boolean;
  comments: string;
}

type CommentsCardProps = {
  name: string
  comment: string
  time: string
  image: string
}

function CommentActions() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      {/* 3 dots button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-gray-200 cursor-pointer"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 w-28 bg-white border rounded shadow z-50">
          <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 cursor-pointer">
            Edit
          </button>
          <button className="block w-full text-left px-3 py-2 hover:bg-red-100 text-red-600 cursor-pointer">
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function CommentsCard({ name, comment, time, image }: CommentsCardProps) {
  return (
    <div className="p-2 bg-gray-100 text-black rounded flex-col">
      <section className="flex flex-row justify-between gap-2">
      <div className="flex flex-row gap-5"><img src={image} className="rounded-full w-8 h-8" />
        <div className="flex flex-col">
        <span className="font-bold text-sm">{name}</span>
        <span className="text-sm mb-1">{time}</span>
         <span className="text-sm"> {comment} </span>
        </div>
      </div>
      
      <div className="self-start"><CommentActions /></div>
      </section>
      <section>
    
      </section>
    </div>
  )
}


export default function DevotionsSection() {
  const [devotions, setDevotions] = useState<DevotionItem[]>(DEVOTIONS_DATA);
  const [comments, setComments] = useState<string[]>([]);
  const [selected, setSelected] = useState<DevotionItem | null>(null);
  const [comment, setComment] = useState("");
  const [closing, setClosing] = useState(false);

  const [addDevotion, setAddDevotion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [verseInput, setVerseInput] = useState("");

   const [book, setBook] = useState<string>("John");
  const [chapter, setChapter] = useState<number>(3);
  const [verse, setVerse] = useState<number>(16);
  const [verseData, setVerseData] = useState<any>(null);

  useEffect(() => {
    const searchVerse = async () => {
      try {
        const response = await fetch(`https://bible-api.com/${book}+${chapter}:${verse}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        console.log(data.reference, data.verses);
        setVerseData(data); // store it in state if needed
      } catch (error) {
        console.error("Error fetching verse:", error);
      }
    };

    searchVerse();
  }, [book, chapter, verse]); // re-run when book, chapter, or verse changes

  const handleHeartReact = (id: number) => {
    setDevotions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isActive = !item.heartActive;
          return {
            ...item,
            heartActive: isActive,
            heart: isActive ? item.heart + 1 : item.heart - 1,
          };
        }
        return item;
      })
    );

    if (selected?.id === id) {
      setSelected((prev) =>
        prev && {
          ...prev,
          heartActive: !prev.heartActive,
          heart: !prev.heartActive ? prev.heart + 1 : prev.heart - 1,
        }
      );
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setSelected(null);
      setClosing(false);
      setAddDevotion(false);
    }, 300);
  };

  const openAddDevotion = () => {
    setAddDevotion(true);
  }

  const onSubmit = () => {
  setIsSubmitting(true);
    const newDevotion: DevotionItem = {
      id: devotions.length + 1,
      title: `${title}`,
      image: `images/devotion3.jpeg`,
      message: `${message}`,
      verse: `${verseInput}`,
      heart: 0,
      heartActive: false,
      comments: "",
    };
    setDevotions((prev) => [newDevotion, ...prev]);
    setIsSubmitting(false);
    handleClose();
  };

   return (
    
    <div className="flex flex-1 flex-col">
      <div className="fixed bottom-10 z-90 right-10">  <Button onClick={openAddDevotion}><IconPlus /> Add Devotion</Button></div>
      
      <div className="@container/main flex flex-1 flex-col gap-2">
        <span className="text-center text-xl font-bold mt-3">Devotion Wall</span>
       
      
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <section
            className="grid gap-2 lg:gap-4 justify-center grid-cols-[repeat(auto-fit,minmax(60px,120px))] lg:grid-cols-[repeat(auto-fit,minmax(240px,240px))]"
            
          >
            {devotions.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`${styles.devotionCard} border rounded-lg p-4 shadow bg-white flex flex-col gap-3`}
              >
                <div>
                  <h2 className="font-semibold text-black text-lg">{item.title}</h2>
                  <span className="text-gray-700 text-sm line-clamp-1">@AndreiBardoquillo</span>
                </div>
                <img src={item.image} alt={item.title} className="lg:h-40 w-auto rounded" />
                <span className="text-gray-700 text-sm line-clamp-1">{item.verse}</span>
                <p className="text-sm text-gray-600 line-clamp-1">{item.message}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span
                    className="text-md flex items-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeartReact(item.id);
                    }}
                  >
                    <IconHeart
                      className={styles.heart}
                      fill={item.heartActive ? "red" : "white"}
                      color={item.heartActive ? "red" : "black"}
                      size={18}
                    />{" "}
                    {item.heart}
                  </span>
                  <span className="flex flex-row gap-1"><FaCommentDots size={18} /> 3</span>
                 
                </div>
              </div>
            ))}

            {/* Modal */}
            {selected && (
              <div
                className={`fixed inset-0 bg-black/40 flex justify-center items-start p-4 z-100 overflow-y-auto  ${
                  closing ? styles.backdropOut : styles.backdropIn
                }`}
                onClick={handleClose}
              >
                <div className="flex flex-col w-full max-w-6xl gap-4 md:flex-col lg:flex-row" onClick={(e) => e.stopPropagation()}>
                  <div
                    className={`bg-white rounded-lg p-6 flex flex-col flex-[2_2_0%] ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}
                  >
                    <div className="overflow-y-auto max-h-[80vh]">
                      <div className="flex flex-col justify-center items-center">
                        <img src={selected.image} className="mb-3 rounded w-full max-w-lg" />
                        <span className="text-gray-700 text-sm mb-5">{selected.verse}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line mt-3">{selected.message}</p>
                    </div>
                  </div>

                  <div
                    className={`bg-white rounded-lg p-6 flex flex-col justify-between flex-[1_1_0%] max-h-[90vh] ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}
                  >
                    <div>
                      <div className="mb-2 flex flex-row justify-between border-b">
                        <div className="flex flex-col">
                      <h2 className="font-semibold text-black text-lg">{selected.title}</h2>
                      <span className="text-gray-700 text-sm">@AndreiBardoquillo</span>
                      </div>
                      <div className="flex flex-row items-center justify-between mb-5">
                      <button className="px-4 py-2 bg-black text-white rounded cursor-pointer" onClick={handleClose}>
                        Close
                      </button>
                    </div>
                    </div>
                    <div className="flex flex-row justify-between mb-2"> <span
                      className="text-lg text-black flex items-center cursor-pointer"
                      onClick={() => handleHeartReact(selected.id)}
                    >
                      <IconHeart fill={selected.heartActive ? "red" : "white"} color={selected.heartActive ? "red" : "black"} className={styles.heart} size={22} />
                      {selected.heart}
                    </span>
                    <span className="flex flex-row justify-center items-center gap-1 text-black"><FaCommentDots size={22}/>3</span>
                    </div>
                      <h3 className="font-semibold text-lg text-black">Comments</h3>
                    <div className="overflow-y-auto mt-2">
                      <div className="flex flex-col gap-3">
                        <CommentsCard name="Robert Andrei L. Bardoquillo" image="images/userIcon.jpg" comment="Awesome post!" time="41 Minutes ago" />
                        <CommentsCard name="Granger Gusion" image="images/userIcon.jpg" comment="Great insights!" time="1 Hour ago" />
                        <CommentsCard name="David Goliath" image="images/userIcon.jpg" comment="Thanks for sharing." time="2 Hours ago" />
                        {/* Add more comments as needed */}
                        {comments.map((c, index) => (
                          <div key={index} className="p-2 bg-gray-100 text-black rounded">
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                    </div>
                    <div className="mt-5">
                      <Input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (comment.trim()) {
                            setComments((prev) => [...prev, comment]);
                            setComment("");
                          }
                        }}
                        placeholder="Add Comment..."
                        name="comment"
                        minLength={8}
                        id="comment"
                        className="input sz-md variant-mixed text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {addDevotion && (
               <form onSubmit={onSubmit} className={`fixed inset-0 bg-black/40 flex justify-center items-center z-100 ${
                  closing ? styles.backdropOut : styles.backdropIn
                }`}>
              <div className={`fixed inset-0 bg-black/40 flex justify-center items-center z-100 ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}>
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">Add New Devotion</h2>
                  <BibleVersePickerNoAPI/>

                  <Input type="text" placeholder="Title"  
                  value={title}
                  required
                  onChange={(e) => setTitle(e.target.value)} 
                  className="mb-3" />

                  <Input type="text" 
                  placeholder="Verse (e.g. John 3:16)" 
                  value={verseInput}
                  required
                  onChange={(e) => setVerseInput(e.target.value)}
                  className="mb-3" />
                  <Input type="text" placeholder="Message" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="mb-3" />
                  <Input type="text" placeholder="Image URL" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="mb-3" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={handleClose}>
                      Cancel
                    </Button>
                     <Button  disabled={isSubmitting} type='submit'>{isSubmitting ? "Adding Devotion..." : "Add Devotion"}</Button>
                  </div>
                </div>
              </div>
              </form>
             )
                  }
          </section>
          
        </div>
      </div>
    </div>
  );
};