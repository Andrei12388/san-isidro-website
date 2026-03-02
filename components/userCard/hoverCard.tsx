"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import styles from "@/components/dashboard/sections/devotions.module.css";

type HoverCardProps = {
  children: ReactNode;
  userId: number;
  name: string;
  title?: string;
  image?: string;
  onView?: () => void;
  onMessage?: () => void;
  className?: string;
  cardClassName?: string;
};

export default function HoverCard({
  children,
  userId,
  name,
  title,
  image,
  onView,
  onMessage,
  className,
  cardClassName,
}: HoverCardProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLSpanElement>(null);

  const handleClose = () => {
    setClosing(true)
    setOpen(true);
    setTimeout(() => {
        setClosing(false);
      setOpen(false);
    }, 300);
  };

  // calculate position
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      setPosition({
        top: rect.bottom,
        left: rect.left,
      });
    }
  }, [open]);

  return (
    <>
      {/* trigger */}
      <span
        ref={triggerRef}
        className={`inline-block cursor-pointer hover:underline ${className ?? ""}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </span>

      {/* portal popup */}
      {open &&
        createPortal(
          <div
            className={`fixed z-[2147483647] w-64 ${closing ? styles.backdropOut : styles.backdropIn} ${cardClassName ?? ""}`}
            style={{
              top: position.top,
              left: position.left,
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={handleClose}
          >
            <div
              className={`p-4 bg-background rounded-xl shadow-xl border ${cardClassName ?? ""}`}
            >
              <div className="flex gap-3 items-center">
                {image && (
                  <img
                    src={image}
                    alt={name}
                    onClick={() => router.push(`/user/${userId}`)}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:brightness-110 transition"
                  />
                )}

                <div>
                  <h3
                    onClick={() => router.push(`/user/${userId}`)}
                    className="font-semibold cursor-pointer hover:underline"
                  >
                    {name}
                  </h3>

                  {title && (
                    <p className="text-sm text-muted-foreground">{title}</p>
                  )}
                </div>
              </div>

              {(onView || onMessage) && (
                <div className="mt-3 flex gap-2">
                  {onView && (
                    <button
                      onClick={() => router.push(`/user/${userId}`)}
                      className="flex-1 px-3 py-1 border border-foreground rounded cursor-pointer"
                    >
                      View Profile
                    </button>
                  )}

                  {onMessage && (
                    <button
                      onClick={onMessage}
                      className="flex-1 px-3 py-1 bg-secondary rounded"
                    >
                      Message
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}