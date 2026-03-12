"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import React, { ReactNode, useEffect, useRef, useState, cloneElement } from "react";
import styles from "@/components/dashboard/sections/devotions.module.css";

type HoverCardProps = {
  children: React.ReactElement<any>;
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
  className,
  cardClassName,
}: HoverCardProps) {

  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLElement | null>(null);

  const handleClose = () => {
    setClosing(true);
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

  // attach hover events to child
  const trigger = cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onClick: () => router.push(`/user/${userId}`),
    className: `cursor-pointer ${children.props.className ?? ""} ${className ?? ""}`,
  });

  return (
    <>
      {trigger}

      {open &&
        createPortal(
          <div
            className={`fixed z-[2147483647] w-64 ${
              closing ? styles.backdropOut : styles.backdropIn
            } ${cardClassName ?? ""}`}
            style={{
              top: position.top,
              left: position.left,
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={handleClose}
            onClick={() => router.push(`/user/${userId}`)}
          >
            <div className="p-4 bg-background rounded-xl shadow-xl border">
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

             
                <div className="mt-3 flex gap-2">
                
                    <button
                      onClick={() => router.push(`/user/${userId}`)}
                      className="flex-1 px-3 py-1 border border-foreground rounded cursor-pointer"
                    >
                      View Profile
                    </button>
                </div>
            
            </div>
          </div>,
          document.body
        )}
    </>
  );
}