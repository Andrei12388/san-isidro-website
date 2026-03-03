import { Logo } from "@/components/logo";
import Image from "next/image";
import Link from "next/link";
import styles from "./components.module.css";

const links = [
  {
    title: "Terms of Service",
    href: "/termsofservice",
  },
  {
    title: "Privacy Policy",
    href: "/privacypolicy",
  },
  {
    title: "Data Deletion",
    href: "/deletepolicy",
  },
];

export default function FooterSection() {
  return (
    <footer className="bg-black w-full flex flex-col py-16 md:py-12 items-start content-start">
      <div className=" w-full flex flex-col items-start px-6">
        <div className="w-full flex flex-row justify-between items-stretch ">
          <Link
            href="/"
            aria-label="go home"
            className="flex flex-row justify-center gap-4 align-middle item size-fit"
          >
            <Image
              src="/images/logonotitle.png"
              alt="San Isidro Logo"
              width={150}
              height={150}
            />
            <span
              className={` ${styles.underline} text-white text-3xl font-bold self-center`}
            >
              JCSGO: SAN ISIDRO OUTREACH
            </span>
          </Link>
        </div>

        <div className=" my-8 flex flex-wrap justify-center gap-6 text-sm mb-0">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-white hover:text-primary block duration-150"
            >
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X/Twitter"
            className={`text-white ${styles.link} hover:text-primary block`}
          >
            <svg
              className="size-6"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
              ></path>
            </svg>
          </Link>

          <Link
            href="https://www.facebook.com/SanIsidroOutreachChamp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className={`text-white ${styles.link} hover:text-primary block`}
          >
            <svg
              className="size-6"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"
              ></path>
            </svg>
          </Link>

          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={`text-white ${styles.link} hover:text-primary block`}
          >
            <svg
              className="size-6"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
              ></path>
            </svg>
          </Link>
        </div>
        <div className=" w-full flex flex-row justify-between items-stretch">
          <span className="text-white block text-center text-sm">
            {" "}
            © {new Date().getFullYear()} JCSGO: SAN ISIDRO All rights reserved
          </span>
          <span className="text-white block text-center text-sm">
            Developed by: Robert Andrei Bardoquillo{" "}
          </span>
        </div>
      </div>
    </footer>
  );
}
