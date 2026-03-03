"use client";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./components.module.css";

export default function ContentSection() {
  const [bgImage, setBgImage] = useState<number>(1);
  const [fade, setFade] = useState<boolean>(true);

  const DURATION = 8000;

  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const nextImage = () => {
    setFade(false);
    startTimeRef.current = 0;
    setProgress(0);

    setTimeout(() => {
      setBgImage((prev) => (prev >= 5 ? 1 : prev + 1));
      setFade(true);
    }, 600);
  };

  const startTimer = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const percent = (elapsed / DURATION) * 100;

      setProgress(Math.min(percent, 100));

      if (elapsed >= DURATION) {
        nextImage();
        startTimeRef.current = performance.now(); // reset cleanly
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    startTimer();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        <div className="w-full h-100 overflow-hidden rounded-(--radius)">
          <img
            onClick={nextImage}
            src={`/images/bg/background${bgImage}.jpg`}
            className={`w-full h-full object-cover cursor-pointer
    transition-opacity duration-500 ease-in-out
    ${fade ? "opacity-100" : "opacity-0"}`}
            style={{
              animation: fade
                ? `${styles.zoomOut} ${DURATION}ms linear forwards`
                : undefined,
            }}
          />
        </div>
        <div className="w-full h-1 bg-muted rounded overflow-hidden mt-0">
          <div
            className="m-auto h-full rounded bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          <h2 className="text-4xl font-medium text-center">
            Building disciples. Growing leaders. Transforming lives.
          </h2>
          <div className="space-y-6 flex flex-col items-center">
            <p className="text-center">
              More than a system, JCSGO San Isidro cultivates a life of
              transformation — guiding individuals from faith foundations to
              leadership, empowering communities to grow deeper in Christ and
              make disciples who make disciples.
            </p>

            <Button
              asChild
              variant="secondary"
              size="sm"
              className="gap-1 pr-1.5"
            >
              <Link href="#">
                <span>Learn More</span>
                <ChevronRight className="size-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
