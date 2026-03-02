"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPlus } from "@tabler/icons-react";
import styles from "./devotions.module.css"; 
import { set } from "nprogress";

interface PostProps {
  id: number;
  title: string;
  image: string;
  description: string;
}

const INITIAL_POSTS: PostProps[] = [
  {
    id: 1,
    title: "March Champfest",
    image: "/images/devotion1.jpeg",
    description: "Join us on March 28.",
  },
  {
    id: 2,
    title: "Soaking",
    image: "/images/devotion2.jpeg",
    description: "Join us for our Soaking event on April 15.",
  },
  {
    id: 3,
    title: "Sunday Celebration",
    image: "/images/devotion3.jpeg",
    description: "See you on Sunday.",
  },
];

export function Posts({ title, image, description }: PostProps) {
  return (
    <div className="group w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm hover:shadow-lg transition justify-between flex flex-col relative">

      {/* Image */}
      <div className="h-48 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        
        <h3 className="absolute font-bold text-white bg-blue-950 dark:bg-blue-700 w-auto max-w-max px-2 py-1 rounded-md top-45">
          {title}
        </h3>
       
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
      </div>
      <div className="flex flex-row justify-end px-2 mb-2">
        <button className="mt-auto self-end px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition cursor-pointer">
          Read More
        </button>
        </div>
    </div>
  );
}

const PostsSection = () => {
  const [posts, setPosts] = useState<PostProps[]>(INITIAL_POSTS);
  const [addingPost, setAddingPost] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [closing, setClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formDescription.trim()) {
      alert("Please fill in all fields");
      return;
    }

    let imageUrl = "/images/defaultPost.jpg"; // fallback
    setIsSubmitting(true);

    // Upload to Cloudinary if image selected
    if (formImage) {
      try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = "unsigned_image";

        const formData = new FormData();
        formData.append("file", formImage);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        imageUrl = data.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        alert("Failed to upload image. Using default.");
      }
    }

    const newPost: PostProps = {
      id: posts.length + 1,
      title: formTitle,
      description: formDescription,
      image: imageUrl,
    };

    setPosts((prev) => [newPost, ...prev]);
    setFormTitle("");
    setFormDescription("");
    setFormImage(null);
    setPreviewImage("");
    setAddingPost(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setClosing(true);

    setFormTitle("");
    setFormDescription("");
    setFormImage(null);
    setPreviewImage("");
    setTimeout(() => {
      setClosing(false);
      setAddingPost(false);
    }, 300);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="fixed bottom-10 z-90 right-10">
        <Button onClick={() => setAddingPost(true)}>
          <IconPlus /> Add Events
        </Button>
      </div>

      <div className="@container/main flex flex-1 flex-col gap-2">
        <span className="text-center text-xl font-bold mt-3">Events</span>

        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <section className="grid gap-2 lg:gap-4 justify-center grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(240px,240px))]">
            {posts.map((post) => (
              <Posts
                key={post.id}
                id={post.id}
                title={post.title}
                image={post.image}
                description={post.description}
              />
            ))}
          </section>
        </div>
      </div>

      {/* Add Post Modal */}
      {addingPost && (
        <div className={`fixed inset-0 bg-black/40 flex justify-center items-center z-100 p-4 overflow-y-auto ${closing ? styles.backdropOut : styles.backdropIn}`}>
          <div className={`bg-background rounded-lg p-6 w-full max-w-md shadow-lg ${closing ? styles.modalOut : styles.modalIn }`}>
            <h2 className="text-lg font-semibold mb-4">Add New Post</h2>
            <form onSubmit={handleAddPost} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold">Title</label>
                <Input
                  type="text"
                  placeholder="Post title..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold">Description</label>
                <textarea
                  placeholder="Post description..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  className="border rounded px-2 py-2 bg-background text-foreground resize-none"
                  rows={4}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border rounded px-2 py-1 cursor-pointer"
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="preview"
                    className="mt-2 max-h-48 rounded"
                  />
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsSection;