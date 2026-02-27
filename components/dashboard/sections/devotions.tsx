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
import { useAuth } from "@/context/AuthContext";
import { create } from "domain";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

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
        className="p-2 rounded hover:bg-muted-foreground cursor-pointer text-foreground"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 w-28 bg-background border rounded shadow z-50">
          <button className="block w-full text-left text-foreground px-3 py-2 hover:bg-muted-foreground cursor-pointer">
            Edit
          </button>
          <button className="block w-full text-left px-3 py-2 hover:bg-muted-foreground text-red-600 cursor-pointer">
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function CommentsCard({ name, comment, time, image }: CommentsCardProps) {
  return (
    <div className="p-2 bg-background text-muted-foreground rounded flex-col">
      <section className="flex flex-row justify-between gap-2">
      <div className="flex flex-row gap-5"><img src={image} className="rounded-full w-8 h-8" />
        <div className="flex flex-col">
        <span className="font-bold text-sm text-foreground">{name}</span>
        <span className="text-sm mb-1">{time}</span>
         <span className="text-sm text-foreground"> {comment} </span>
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
  const { access_token } = useAuth();

  const [addDevotion, setAddDevotion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [verseInput, setVerseInput] = useState("");

   const [book, setBook] = useState<string>("John");
  const [chapter, setChapter] = useState<number>(3);
  const [verse, setVerse] = useState<number>(16);
  const [verseData, setVerseData] = useState<any>(null);

  useEffect(() => {
    const devotionData = async () => {
      try {
          const response = await fetch(`${API_BASE}/api/postgre/devotions`);
          if (!response.ok) throw new Error("Failed to fetch devotions");
          const data = await response.json();
         // setDevotions(data);
         console.log("Fetched devotions:", data);
      } catch (error) {
          console.error("Error fetching devotions:", error);
      }
    };

    devotionData();
  }, []);

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

  const handleSetImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // get the selected file
    if (file) {
      setImage(file); // store the File object
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setVerseInput(e.target.value)

  e.target.style.height = "auto"
  e.target.style.height = e.target.scrollHeight + "px"
}


  const handleChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setMessage(e.target.value)

  e.target.style.height = "auto"
  e.target.style.height = e.target.scrollHeight + "px"
}

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
    setTitle("");
    setVerseInput("");
    setMessage("");
    setImage(null);
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!access_token) {
      console.warn("no access token, user probably not authenticated");
      alert("You must be logged in to add a devotion.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/postgre/devotions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            title,
            content: message,
            scriptureReference: verseInput,
            image: image ? URL.createObjectURL(image) : null,
            devotionDate: new Date().toISOString(), // required by prisma
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = errData?.error || res.statusText || "unknown error";
        throw new Error(msg);
      }

      // optionally handle returned data
    } catch (error: any) {
      console.error("Error submitting devotion:", error);
      alert(`Unable to submit devotion: ${error.message}`);
    }

    const newDevotion: DevotionItem = {
      id: devotions.length + 1,
      title: `${title}`,
      image: `${image ? URL.createObjectURL(image) : "images/defaultDevotion.jpg"}`,
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
                className={`${styles.devotionCard} border rounded-lg p-4 shadow bg-background flex flex-col gap-3`}
              >
                <div>
                  <h2 className="font-semibold text-foreground text-lg">{item.title}</h2>
                  <span className="text-muted-foreground text-sm line-clamp-1">@AndreiBardoquillo</span>
                </div>
                <img src={item.image} alt={item.title} className="lg:h-40 w-auto rounded" />
                <span className="text-muted-foreground text-sm line-clamp-1">{item.verse}</span>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.message}</p>
                <div className="flex justify-between text-sm text-foreground-500">
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
                    className={`bg-background rounded-lg p-6 flex flex-col flex-[2_2_0%] ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}
                  >
                    <div className="overflow-y-auto max-h-[80vh]">
                      <div className="flex flex-col justify-center items-center">
                        <img src={selected.image} className="mb-3 rounded w-full max-w-lg" />
                        <span className="text-muted-foreground text-sm mb-5">{selected.verse}</span>
                      </div>
                      <p className="text-foreground whitespace-pre-line mt-3">{selected.message}</p>
                    </div>
                  </div>

                  <div
                    className={`bg-background rounded-lg p-6 flex flex-col justify-between flex-[1_1_0%] max-h-[90vh] ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}
                  >
                    <div className="overflow-y-auto">
                      <div className="mb-2 flex flex-row justify-between border-b">
                        <div className="flex flex-col">
                      <h2 className="font-semibold text-foreground text-lg">{selected.title}</h2>
                      <span className="text-muted-foreground text-sm">@AndreiBardoquillo</span>
                      </div>
                      <div className="flex flex-row items-center justify-between mb-5">
                      <button className="px-4 py-2 bg-background text-foreground rounded cursor-pointer" onClick={handleClose}>
                        Close
                      </button>
                    </div>
                    </div>
                    <div className="flex flex-row justify-between mb-2"> <span
                      className="text-lg text-foreground flex items-center cursor-pointer"
                      onClick={() => handleHeartReact(selected.id)}
                    >
                      <IconHeart fill={selected.heartActive ? "red" : "white"} color={selected.heartActive ? "red" : "black"} className={styles.heart} size={22} />
                      {selected.heart}
                    </span>
                    <span className="flex flex-row justify-center items-center gap-1 text-muted-foreground"><FaCommentDots size={22}/>3</span>
                    </div>
                      <h3 className="font-semibold text-lg text-foreground">Comments</h3>
                    <div className="overflow-y-auto mt-2">
                      <div className="flex flex-col gap-3">
                        <CommentsCard name="Robert Andrei L. Bardoquillo" image="images/userIcon.jpg" comment="Awesome post!" time="41 Minutes ago" />
                        <CommentsCard name="Granger Gusion" image="images/userIcon.jpg" comment="Great insights!" time="1 Hour ago" />
                        <CommentsCard name="David Goliath" image="images/userIcon.jpg" comment="Thanks for sharing." time="2 Hours ago" />
                        {/* Add more comments as needed */}
                        {comments.map((c, index) => (
                          <div key={index} className="p-2 bg-background text-foreground rounded">
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
                        className="input sz-md variant-mixed text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {addDevotion && (
               <form onSubmit={onSubmit} className={`fixed inset-0 bg-black/40 flex justify-center items-start overflow-y-auto z-100 ${
                  closing ? styles.backdropOut : styles.backdropIn
                }`}>
              <div className={`lg:fixed overflow-y-auto inset-0 bg-black/40 flex lg:flex-row flex-col lg:justify-end justify-center items-center lg:items-start z-100 ${
                      closing ? styles.modalOut : styles.modalIn
                    }`}>
                      <div className="bg-background lg:rounded-lg p-6 w-full lg:h-full lg:max-w-md lg:mr-2 flex flex-col lg:overflow-y-auto border-b">
                        <h2 className="text-lg font-semibold text-center mb-5 border-b">Bible Verse</h2>
                        <BibleVersePickerNoAPI/>
                        </div>
                <div className="bg-background lg:rounded-lg p-6 w-full lg:h-full max-w-3xl flex flex-col justify-between">
                  <div className="overflow-y-auto">
                  <h2 className="text-lg font-semibold mb-4">Add New Devotion</h2>
                 
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1 w-full">
                    <span className="text-lg font-semibold">Title</span>
                  <Input type="text" placeholder="Title"  
                  value={title}
                  required
                  onChange={(e) => setTitle(e.target.value)}/>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-semibold">Verse</span>
                 <textarea
                  placeholder="Verse (e.g. John 3:16)"
                  value={verseInput}
                  required
                  rows={1}
                  onChange={handleChange}
                  className="mb-3 w-full resize-none overflow-hidden border border-muted-foreground rounded px-2"
                />
                  </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-5">
                  <span className="text-lg font-semibold">Image</span> 
                 <input
                    className="border rounded px-2 py-1 cursor-pointer"
                    type="file"
                    accept="image/*"
                    onChange={handleSetImage}
                  />

                  {image && (
                    <div className="mt-3 flex flex-row justify-center">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="preview"
                        className="max-w-xs max-h-64 mt-2"
                      />
                    </div>
                  )}
                    </div>
                  <span className="text-lg font-semibold">Message</span>
                    <textarea
                  placeholder="Message"
                  value={message}
                  required
                  rows={10}
                  onChange={handleChangeMessage}
                  className="mb-3 w-full overflow-hidden border border-muted-foreground rounded px-2"
                />
                  </div>
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