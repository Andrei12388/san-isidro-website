'use client'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import  styles from './components.module.css'

export default function ContentSection() {
  const [bgImage, setBgImage] = useState(1);
  const [fade, setFade] = useState(true);

  const nextImage = () => {
    setFade(false); // fade out first

    setTimeout(() => {
      setBgImage(prev => (prev >= 4 ? 1 : prev + 1));
      setFade(true); // fade in
    }, 300); // match transition time
  };

  useEffect(() => {
    const interval = setInterval(() => {
    
      setFade(false);

      setTimeout(() => {
       
        setBgImage(prev => (prev >= 5 ? 1 : prev + 1));
        setFade(true); // fade in
      }, 500); // 
    }, 8000); //

    return () => clearInterval(interval);
  }, []);
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
                 <img onClick={nextImage}
      src={`/images/bg/background${bgImage}.jpg`}
      className={`w-full h-100 object-cover rounded-(--radius)
        transition-opacity duration-500 ease-in-out
        ${fade ? "opacity-100" : "opacity-0"}`}
      alt="bg"
    />

                <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-medium">Building disciples. Growing leaders. Transforming lives.</h2>
                    <div className="space-y-6">
                        <p>More than a system, JCSGO San Isidro cultivates a life of transformation — guiding individuals from faith foundations to leadership, empowering communities to grow deeper in Christ and make disciples who make disciples.</p>

                        <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="gap-1 pr-1.5">
                            <Link href="#">
                                <span>Learn More</span>
                                <ChevronRight className="size-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
