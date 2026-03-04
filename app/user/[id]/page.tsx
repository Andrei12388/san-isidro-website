"use client";

import { NavUser } from "@/components/dashboard/nav-user";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  IconBell,
  IconCake,
  IconGenderBigender,
  IconMail,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/loadingSpinner";
import styles from "@/components/dashboard/sections/devotions.module.css";
import { FaPrayingHands } from "react-icons/fa";
import DOMPurify from "dompurify";

interface UserType {
  name: string;
  email: string;
  avatar: string;
  id: number;
}

interface PersonalInfoType {
  firstName: string;
  middleName: string;
  lastName: string;
  birthday: string;
  bio: string;
  gender: string;
  level: string;
  groupName: string;
  ministry: string;
  phone: string;
  city: string;
  barangay: string;
  country: string;
  houseNumber: string;
  profileImage: string;
  user?: {
    id: number;
    name: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<UserType | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoType | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { access_token } = useAuth();
  const userId = id;

  useEffect(() => {
      DOMPurify.addHook("afterSanitizeAttributes", (node) => {
        if (node.tagName === "A") {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        }
      });
    }, []);

  const handleClose = () => {
    setClosing(true);
    setIsImageOpen(true);
    setTimeout(() => {
      setClosing(false);
      setIsImageOpen(false);
    }, 300);
  };

  // Set document title when personalInfo is loaded
  useEffect(() => {
    if (personalInfo?.firstName || personalInfo?.lastName) {
      document.title =
        `${personalInfo.firstName || ""} ${personalInfo.middleName || ""} ${personalInfo.lastName || ""} - Profile`.trim();
    }
  }, [personalInfo]);

  // Calculate age from birthday
  const calculateAge = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();

    const m = today.getMonth() - date.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    return age.toString();
  };

  const age = calculateAge(personalInfo?.birthday);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!access_token) {
          setError("Not authenticated");
          setIsLoading(false);
          return;
        }

        // Get current user session for header
        const sessionRes = await fetch(`${API_BASE}/api/auth/getSession`);
        const sessionData = await sessionRes.json();

        setUser({
          id: sessionData.user,
          name: sessionData.name,
          email: sessionData.email,
          avatar: sessionData.profileImage,
        });

        // Fetch the requested user's personal info
        const personalInfoRes = await fetch(
          `${API_BASE}/api/postgre/personal-info/?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          },
        );

        if (!personalInfoRes.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const personalData = await personalInfoRes.json();
        const fetchedPersonalInfo = personalData.data || {};
        setPersonalInfo(fetchedPersonalInfo);

        // Update user with email from personal info response and session
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (access_token && userId) {
      fetchUserProfile();
    }
  }, [access_token, userId]);

  if (isLoading) {
    return (
      <main className="h-screen w-full flex flex-col overflow-hidden">
        <header className="fixed top-0 z-50 w-full bg-background border-b">
          <div className="flex justify-between items-center px-5">
            <a
              href="/"
              className="flex gap-2 p-2 items-center rounded-sm hover:bg-muted-foreground/30"
            >
              <Image
                src="/images/logonotitle.png"
                alt="logo"
                width={40}
                height={40}
              />
              <h1 className="hidden sm:block font-bold">JCSGO: SAN ISIDRO</h1>
            </a>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <Spinner size={32} />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="h-screen w-full flex flex-col overflow-hidden">
        <header className="fixed top-0 z-50 w-full bg-background border-b">
          <div className="flex justify-between items-center px-5">
            <a
              href="/"
              className="flex gap-2 p-2 items-center rounded-sm hover:bg-muted-foreground/30"
            >
              <Image
                src="/images/logonotitle.png"
                alt="logo"
                width={40}
                height={40}
              />
              <h1 className="hidden sm:block font-bold">JCSGO: SAN ISIDRO</h1>
            </a>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center mt-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push("/devotions")}>
              Back to Devotions
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <meta
          name="description"
          content={`${personalInfo?.firstName} ${personalInfo?.middleName || ""} ${personalInfo?.lastName} - User Profile`}
        />
      </Head>
      <main className="h-screen w-full flex flex-col overflow-hidden">
        {/* header navigation*/}
        <header className="fixed top-0 z-50 w-full bg-background border-b">
          <div className="flex justify-between items-center px-5">
            <a
              href="/"
              className="flex gap-2 p-2 items-center rounded-sm hover:bg-muted-foreground/30"
            >
              <Image
                src="/images/logonotitle.png"
                alt="logo"
                width={40}
                height={40}
              />
              <h1 className="hidden sm:block font-bold">JCSGO: SAN ISIDRO</h1>
            </a>

            <div className="flex items-center ml-2 gap-2">
              <Button size="icon" variant="outline">
                <IconMail />
              </Button>
              <Button size="icon" variant="outline">
                <IconBell />
              </Button>
              {user && <NavUser item={user} />}
            </div>
          </div>
        </header>

        <div className="min-h-full w-full hide-scrollbar-arrows overflow-y-auto flex-1 pt-15 max-w-6xl mx-auto px-4 pb-10 space-y-6">
          {/* Header Section */}
          {/* <div className="sticky top-0 z-40 bg-muted flex flex-wrap justify-between align-middle items-center rounded-2xl border shadow-lg p-5 gap-4">
            <span className="text-2xl font-semibold">{personalInfo?.firstName} {personalInfo?.middleName} {personalInfo?.lastName} - Profile</span>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
          */}

          {/* Basic Info Section */}
          <section className="top-4 bg-muted rounded-2xl shadow-lg">
            {/* Upper part border */}
            <div className="px-5 py-3 border-b">
              <h1 className="text-lg font-semibold">Basic Info</h1>
            </div>

            {/* Lower part border */}
            <div className="p-5 flex flex-col md:flex-row gap-5 items-center md:items-start justify-between">
              {/* Profile Image */}
              <div className=" flex flex-row items-center gap-5">
              <div className="shrink-0">
                <img
                  src={
                    personalInfo?.profileImage ||
                    user?.avatar ||
                    "images/userIcon.png"
                  }
                  alt={user?.name}
                  onClick={() => setIsImageOpen(true)}
                  className={`rounded-full w-24 h-24 object-cover border-2 border-foreground cursor-pointer ${styles.imageHover}`}
                />
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-lg">
                  {personalInfo?.firstName} {personalInfo?.middleName}{" "}
                  {personalInfo?.lastName}
                </span>
                <span className="text-sm opacity-70 flex flex-wrap gap-1 lg:gap-2 items-center">
                <span className="flex items-center gap-1">
                  ID: {personalInfo?.user?.id || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  Age: {age || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  Status: Active
                  <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                </span>
              </span>
              </div>
              </div>

              <div className="flex flex-col px-4 rounded-md w-full h-full max-h-100">
                <div
                                        className="
                                        text-center
                                   max-w-none
                                  [&_a]:text-blue-600
                                  [&_a]:underline
                                  [&_a]:font-medium
                                  [&_a:hover]:text-blue-800
                                "
                                        dangerouslySetInnerHTML={{
                                          __html: DOMPurify.sanitize(personalInfo?.bio || ''),
                                        }}
                                      />
              </div>
            </div>

            {/* Personal Details Grid */}
            <div className="w-full px-5 gap-y-2 gap-x-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5 mt-2 pb-5 justify-items-center items-center">
              {/* Birthday */}
              <div className="flex flex-col gap-2">
                <label className="text-medium font-medium opacity-70 flex flex-row items-center gap-2">
                  <IconCake size={16} /> Birthday
                </label>
                <div className="rounded-sm px-3 py-2">
                  {personalInfo?.birthday
                    ? new Date(personalInfo.birthday).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-2">
                <label className="text-medium font-medium opacity-70 flex flex-row items-center gap-2">
                  <IconGenderBigender size={16} /> Gender
                </label>
                <div className="rounded-sm px-3 py-2">
                  {personalInfo?.gender
                    ? personalInfo.gender.charAt(0).toUpperCase() +
                      personalInfo.gender.slice(1)
                    : "N/A"}
                </div>
              </div>

              {/* Level */}
              <div className="flex flex-col gap-2">
                <label className="text-medium font-medium opacity-70 flex flex-row items-center gap-2">
                  <IconUser size={16} /> Level
                </label>
                <div className="rounded-sm px-3 py-2">
                  {personalInfo?.level
                    ? personalInfo.level.charAt(0).toUpperCase() +
                      personalInfo.level.slice(1)
                    : "N/A"}
                </div>
              </div>

              {/* Ministry */}
              <div className="flex flex-col gap-2">
                <label className="text-medium font-medium opacity-70 flex flex-row items-center gap-2">
                  <FaPrayingHands size={16} /> Ministry
                </label>
                <div className="rounded-sm px-3 py-2">
                  {personalInfo?.ministry
                    ? personalInfo.ministry.charAt(0).toUpperCase() +
                      personalInfo.ministry.slice(1)
                    : "N/A"}
                </div>
              </div>

              {/* Group */}
              <div className="flex flex-col gap-2">
                <label className="text-medium font-medium opacity-70 flex flex-row items-center gap-2">
                  <IconUsersGroup size={16} /> Group
                </label>
                <div className="rounded-sm px-3 py-2">
                  {personalInfo?.groupName
                    ? personalInfo.groupName.charAt(0).toUpperCase() +
                      personalInfo.groupName.slice(1)
                    : "N/A"}
                </div>
              </div>
            </div>

                    {/* Contact and Address Cards */}
          <div className="mt-5 px-2 py-2">
            <div className="grid gap-2 md:grid-cols-2">
              {/* Contacts Section */}
              <div className="rounded-2xl border bg-muted shadow-lg overflow-hidden">
                <div className="px-5 py-3 border-b bg-muted/70">
                  <h2 className="text-lg font-semibold">Contacts</h2>
                </div>

                <div className="p-5 flex flex-row gap-5 align-middle items-center content-center">
                  <svg
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 600.000000 600.000000"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {" "}
                    <g
                      transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
                      className="fill-foreground"
                    >
                      {" "}
                      <path d="M2670 5830 c-558 -75 -1058 -296 -1490 -658 -116 -98 -312 -297 -403 -412 -516 -647 -731 -1484 -592 -2308 81 -477 293 -946 601 -1332 93 -115 327 -348 449 -445 521 -416 1147 -635 1815 -635 803 0 1536 312 2096 891 440 456 717 1039 796 1679 19 154 16 554 -5 709 -47 337 -137 632 -281 920 -158 314 -325 541 -588 796 -461 449 -1032 721 -1678 800 -176 21 -543 19 -720 -5z m710 -356 c849 -109 1581 -635 1961 -1409 184 -377 268 -764 256 -1185 -4 -107 -11 -229 -17 -270 -83 -574 -327 -1067 -730 -1470 -401 -401 -923 -655 -1490 -725 -161 -20 -459 -20 -620 0 -443 55 -870 228 -1229 498 -125 94 -343 306 -444 432 -657 816 -751 1956 -235 2858 520 908 1512 1403 2548 1271z" />{" "}
                      <path d="M2902 4489 c-690 -66 -1213 -506 -1362 -1144 -42 -182 -55 -451 -30 -635 79 -587 434 -1023 989 -1215 214 -73 508 -112 766 -100 267 13 372 49 411 142 34 79 0 183 -71 218 -37 18 -63 19 -345 20 -278 0 -314 2 -407 23 -487 107 -791 388 -904 835 -30 119 -38 397 -14 539 91 558 504 919 1090 954 184 11 383 -19 545 -83 239 -94 439 -294 534 -536 138 -349 103 -824 -67 -927 -68 -42 -157 -16 -193 56 -18 36 -19 71 -24 464 -6 475 -5 466 -78 532 -95 86 -293 73 -365 -24 -31 -42 -47 -90 -47 -139 0 -34 -3 -39 -23 -39 -16 0 -28 12 -46 45 -32 61 -120 141 -185 170 -149 66 -336 56 -496 -25 -77 -39 -181 -153 -228 -250 -71 -145 -86 -217 -86 -425 0 -194 9 -253 60 -384 98 -247 316 -400 571 -401 180 0 323 81 397 228 35 68 53 67 90 -3 50 -97 149 -166 285 -201 100 -25 310 -16 416 19 299 98 476 361 516 767 40 411 -100 828 -370 1101 -313 315 -801 469 -1329 418z m223 -1238 c83 -38 129 -118 146 -251 19 -153 -18 -297 -91 -364 -86 -78 -197 -73 -280 12 -72 75 -103 216 -81 362 26 165 108 260 226 260 22 0 58 -9 80 -19z" />{" "}
                    </g>{" "}
                  </svg>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      (+63) {personalInfo?.phone || "N/A"}
                    </span>
                    <span className="text-sm opacity-70">
                      {personalInfo?.user?.email || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex lg:flex-row flex-col px-5 gap-3 justify-between pb-5">
                  <div className="basis-1/2 gap-2 rounded-sm flex flex-col">
                    <span className="text-sm font-medium">Phone</span>
                    <div className="rounded-sm px-3 py-2 border">
                      {personalInfo?.phone || "N/A"}
                    </div>
                  </div>
                  <div className="basis-1/2 gap-2 rounded-sm flex flex-col">
                    <span className="text-sm font-medium">Email</span>
                    <div className="rounded-sm px-3 py-2 border break-all">
                      {personalInfo?.user?.email || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="rounded-2xl border bg-muted shadow-lg overflow-hidden">
                <div className="px-5 py-3 border-b bg-muted/70">
                  <h2 className="text-lg font-semibold">Address</h2>
                </div>

                <div className="p-5 flex flex-row gap-5 align-middle items-center content-center">
                  <div>
                    {" "}
                    <svg
                      version="1.0"
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 1800.000000 1800.000000"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {" "}
                      <g
                        transform="translate(0.000000,1800.000000) scale(0.100000,-0.100000)"
                        className="fill-foreground"
                      >
                        {" "}
                        <path d="M8590 17715 c-14 -2 -106 -9 -205 -15 -250 -15 -495 -38 -590 -55 -44 -8 -97 -15 -117 -15 -21 0 -70 -6 -110 -14 -75 -15 -174 -32 -263 -45 -27 -5 -70 -13 -95 -18 -25 -6 -81 -18 -125 -28 -107 -22 -197 -43 -270 -61 -33 -9 -87 -22 -120 -31 -82 -20 -162 -43 -210 -59 -23 -8 -48 -14 -57 -14 -10 0 -32 -6 -50 -14 -18 -7 -60 -21 -93 -31 -33 -9 -76 -23 -95 -30 -82 -29 -107 -37 -135 -45 -16 -5 -55 -18 -85 -30 -30 -12 -66 -25 -80 -30 -14 -4 -36 -12 -50 -18 -14 -5 -45 -18 -70 -27 -25 -10 -58 -23 -75 -30 -16 -8 -66 -28 -110 -45 -44 -18 -93 -38 -110 -46 -16 -7 -57 -25 -90 -39 -33 -15 -80 -36 -105 -47 -71 -32 -478 -237 -545 -274 -33 -18 -67 -37 -75 -41 -8 -4 -71 -40 -139 -80 -67 -40 -125 -73 -127 -73 -3 0 -17 -9 -32 -19 -45 -32 -236 -156 -247 -160 -5 -2 -26 -17 -46 -32 -20 -16 -40 -29 -43 -29 -25 0 -675 -497 -781 -597 -16 -15 -63 -57 -105 -93 -130 -112 -159 -139 -385 -365 -283 -283 -434 -450 -650 -719 -38 -48 -83 -102 -98 -119 -15 -18 -40 -50 -55 -72 -15 -22 -29 -42 -33 -45 -11 -11 -247 -344 -274 -388 -6 -9 -36 -55 -66 -102 -66 -100 -257 -414 -270 -444 -5 -12 -18 -35 -28 -51 -48 -79 -217 -410 -281 -550 -65 -141 -99 -219 -123 -277 -8 -18 -21 -49 -29 -68 -9 -19 -22 -53 -31 -75 -8 -22 -36 -92 -60 -155 -25 -63 -47 -124 -50 -135 -3 -11 -15 -45 -27 -75 -11 -30 -30 -84 -41 -120 -12 -36 -27 -81 -34 -100 -7 -19 -20 -62 -30 -95 -10 -33 -23 -80 -31 -105 -20 -67 -40 -137 -58 -210 -10 -36 -22 -81 -28 -100 -7 -19 -15 -53 -18 -75 -4 -22 -13 -62 -20 -90 -37 -150 -55 -236 -84 -390 -20 -108 -45 -262 -50 -305 -2 -19 -8 -66 -14 -105 -22 -136 -34 -241 -42 -350 -5 -60 -14 -164 -21 -230 -9 -80 -13 -285 -13 -610 -1 -503 13 -785 49 -1011 8 -49 15 -110 15 -133 0 -24 7 -80 15 -125 8 -44 21 -126 30 -181 9 -55 22 -128 30 -162 8 -34 15 -72 15 -85 0 -12 7 -54 16 -93 26 -113 41 -177 54 -225 6 -25 15 -65 19 -90 4 -25 12 -61 19 -80 6 -19 18 -64 27 -100 10 -36 23 -85 30 -110 8 -25 21 -70 29 -100 16 -53 51 -168 94 -300 12 -36 30 -90 42 -120 11 -30 30 -82 41 -115 20 -57 39 -108 111 -285 32 -79 38 -94 87 -203 17 -37 31 -69 31 -72 0 -14 179 -378 252 -512 123 -228 136 -250 220 -388 43 -71 84 -139 91 -150 37 -62 253 -383 308 -458 35 -48 87 -119 114 -156 98 -134 285 -362 440 -536 209 -236 556 -582 760 -760 38 -33 83 -73 99 -88 31 -29 82 -71 249 -206 112 -91 302 -234 392 -296 71 -49 356 -240 391 -262 56 -36 355 -215 394 -236 25 -13 71 -39 103 -56 31 -18 99 -52 150 -77 50 -25 99 -50 107 -54 95 -53 349 -170 530 -244 63 -26 129 -53 145 -61 29 -12 69 -28 158 -61 23 -9 57 -22 75 -30 18 -8 39 -14 47 -14 8 0 29 -6 47 -14 60 -25 157 -60 233 -82 28 -8 64 -19 80 -24 94 -29 136 -41 185 -55 101 -29 205 -57 245 -65 22 -5 60 -14 85 -20 78 -20 152 -38 235 -55 44 -9 112 -22 150 -30 39 -8 113 -22 165 -30 52 -9 122 -21 155 -27 33 -6 94 -14 135 -18 41 -4 107 -13 145 -19 494 -76 1457 -89 1925 -25 58 8 130 14 160 14 30 1 75 5 100 11 25 5 79 14 120 18 109 13 216 30 287 47 34 8 73 14 88 14 15 0 54 7 88 15 34 8 98 21 142 30 44 9 105 23 135 30 30 8 87 21 125 30 39 9 94 23 123 31 28 7 77 21 107 29 155 42 216 61 410 125 256 84 324 108 412 146 17 8 36 14 41 14 6 0 23 6 39 14 15 8 100 45 188 82 195 81 319 137 365 164 8 5 62 32 120 60 100 49 118 58 158 80 9 5 37 19 62 31 44 22 180 99 210 119 8 6 22 13 30 17 31 14 312 185 375 228 36 25 67 45 69 45 3 0 40 25 83 56 43 30 102 72 131 92 149 103 462 340 492 372 3 3 28 23 55 45 28 22 57 46 66 55 9 8 45 40 80 70 263 227 618 578 824 815 39 44 72 82 75 85 7 6 118 137 176 206 46 55 320 420 379 504 63 89 201 296 208 311 4 8 15 26 25 40 15 24 129 212 181 299 11 19 32 58 46 85 15 28 42 77 61 110 55 97 314 624 314 640 0 3 13 33 28 67 16 35 37 83 47 108 9 25 23 59 30 75 7 17 21 50 30 75 10 25 22 56 28 70 15 37 67 180 77 215 11 39 59 180 75 225 17 46 75 240 119 402 36 132 85 340 120 513 9 44 23 109 31 145 9 36 15 79 15 95 0 17 7 55 15 85 8 30 15 75 15 100 0 25 7 70 15 100 8 30 15 73 15 95 0 22 6 90 15 150 41 307 48 459 48 990 0 533 -2 570 -49 990 -32 289 -75 561 -120 752 -8 34 -14 71 -14 84 0 12 -6 45 -14 73 -8 28 -22 83 -31 121 -25 110 -60 245 -90 352 -9 29 -23 79 -31 110 -9 32 -23 73 -30 91 -8 18 -14 39 -14 47 0 8 -6 29 -14 47 -8 18 -30 83 -50 143 -34 106 -71 210 -116 325 -12 30 -25 67 -30 81 -4 14 -12 34 -18 45 -6 10 -25 55 -43 99 -30 75 -52 125 -101 235 -35 77 -246 502 -276 555 -16 28 -43 77 -61 110 -33 61 -191 325 -223 374 -10 14 -21 32 -24 40 -6 12 -56 86 -194 291 -47 69 -341 460 -391 520 -395 471 -728 812 -1113 1141 -15 13 -39 34 -53 47 -42 38 -302 244 -423 334 -247 185 -467 331 -730 487 -85 50 -162 96 -170 101 -8 5 -35 20 -60 33 -25 14 -74 41 -110 61 -134 74 -518 260 -630 306 -30 12 -77 32 -105 45 -27 12 -70 30 -95 39 -25 10 -54 23 -64 28 -11 6 -31 14 -45 18 -14 5 -51 18 -81 30 -30 12 -66 25 -80 30 -14 5 -90 32 -170 60 -80 28 -158 55 -175 60 -16 5 -52 16 -80 24 -206 63 -370 109 -445 126 -19 4 -57 13 -85 20 -156 38 -169 41 -385 86 -36 7 -110 20 -165 29 -55 9 -125 21 -155 27 -30 6 -89 14 -130 18 -41 4 -106 13 -145 19 -84 12 -323 36 -530 52 -139 11 -828 21 -885 14z m890 -1094 c197 -17 405 -40 480 -53 36 -5 97 -14 135 -18 68 -8 112 -16 263 -46 167 -33 230 -46 278 -60 28 -8 59 -14 69 -14 10 0 43 -7 74 -16 31 -8 79 -21 106 -29 89 -23 169 -46 200 -57 17 -5 46 -13 65 -18 19 -4 46 -12 60 -18 14 -6 59 -20 100 -33 41 -12 82 -26 90 -29 25 -12 83 -31 119 -40 18 -5 38 -13 44 -19 6 -6 19 -11 28 -11 10 0 30 -6 46 -14 15 -8 46 -21 68 -29 52 -19 189 -75 240 -97 153 -68 321 -147 386 -181 20 -10 78 -41 130 -68 52 -27 117 -61 144 -76 28 -14 64 -35 80 -45 17 -11 37 -23 45 -27 30 -14 217 -127 300 -182 47 -30 93 -60 102 -66 15 -9 49 -32 198 -135 25 -17 56 -40 70 -50 93 -69 158 -118 186 -140 272 -208 636 -537 864 -781 74 -79 139 -149 145 -155 44 -47 148 -165 166 -189 20 -26 44 -55 149 -181 36 -44 229 -302 275 -369 67 -96 188 -276 200 -297 5 -9 42 -70 82 -135 96 -159 108 -180 138 -238 14 -27 36 -66 47 -85 26 -43 176 -343 212 -422 14 -32 37 -82 50 -110 13 -29 34 -78 46 -108 12 -30 28 -68 35 -85 7 -16 21 -50 30 -75 17 -44 26 -65 59 -143 9 -21 16 -44 16 -52 0 -7 6 -26 14 -42 15 -30 33 -80 46 -128 5 -16 14 -46 21 -65 38 -111 34 -97 84 -270 8 -25 20 -70 29 -100 8 -30 22 -80 30 -111 9 -31 16 -64 16 -74 0 -9 6 -38 14 -64 19 -60 37 -135 46 -191 4 -25 13 -72 20 -105 44 -226 59 -313 70 -415 4 -36 12 -103 18 -150 43 -322 47 -396 47 -925 -1 -529 -4 -595 -47 -915 -6 -47 -14 -114 -18 -150 -11 -102 -26 -189 -70 -415 -7 -33 -16 -80 -20 -105 -9 -56 -27 -131 -46 -191 -8 -26 -14 -55 -14 -64 0 -10 -7 -43 -16 -74 -8 -31 -22 -81 -30 -111 -29 -104 -74 -258 -89 -300 -7 -19 -18 -51 -24 -70 -7 -19 -16 -48 -21 -65 -13 -48 -31 -98 -46 -128 -8 -16 -14 -36 -14 -46 0 -9 -7 -26 -15 -37 -8 -10 -15 -27 -15 -37 0 -11 -6 -31 -14 -45 -8 -15 -22 -47 -31 -72 -10 -25 -24 -61 -33 -80 -8 -19 -20 -48 -27 -65 -6 -16 -20 -48 -29 -70 -10 -22 -24 -53 -31 -70 -48 -113 -184 -388 -251 -510 -25 -44 -51 -93 -60 -110 -27 -54 -144 -248 -214 -355 -27 -41 -53 -82 -56 -90 -4 -8 -19 -31 -33 -50 -14 -19 -30 -43 -36 -52 -79 -133 -452 -614 -613 -791 -181 -198 -371 -392 -518 -527 -125 -116 -231 -210 -261 -234 -31 -23 -77 -62 -102 -87 -23 -22 -265 -209 -311 -240 -21 -14 -51 -35 -67 -47 -79 -61 -202 -148 -251 -177 -9 -6 -44 -28 -77 -50 -33 -22 -68 -44 -77 -50 -9 -5 -50 -30 -90 -54 -40 -25 -84 -51 -98 -59 -14 -7 -38 -22 -55 -32 -16 -10 -50 -30 -75 -43 -25 -14 -74 -41 -110 -61 -68 -38 -393 -199 -470 -234 -25 -11 -75 -34 -113 -51 -37 -17 -71 -31 -76 -31 -5 0 -24 -8 -43 -17 -65 -32 -72 -36 -97 -43 -14 -5 -51 -18 -81 -30 -30 -12 -66 -25 -80 -30 -14 -5 -50 -18 -80 -30 -30 -12 -68 -25 -85 -30 -28 -8 -53 -16 -135 -45 -19 -7 -62 -21 -95 -30 -33 -10 -78 -24 -100 -30 -22 -7 -67 -20 -100 -29 -33 -10 -76 -22 -95 -28 -19 -7 -53 -15 -75 -19 -45 -9 -140 -31 -200 -47 -22 -5 -74 -17 -115 -25 -41 -9 -107 -23 -146 -31 -40 -9 -82 -16 -95 -16 -13 0 -55 -6 -94 -14 -38 -8 -122 -22 -185 -30 -63 -9 -167 -22 -230 -31 -63 -8 -144 -15 -180 -15 -36 0 -130 -7 -210 -15 -352 -35 -1080 -8 -1490 56 -36 6 -100 14 -142 19 -43 5 -82 11 -88 15 -5 3 -40 10 -78 15 -71 8 -152 23 -242 45 -30 7 -91 21 -135 30 -44 9 -102 22 -130 29 -173 46 -254 68 -330 91 -22 6 -67 20 -100 30 -33 9 -76 23 -95 30 -82 29 -107 37 -135 45 -16 5 -55 18 -85 30 -30 12 -66 25 -80 30 -14 5 -50 18 -80 30 -30 12 -69 26 -87 31 -18 5 -35 14 -38 19 -4 6 -13 10 -21 10 -7 0 -43 14 -77 30 -35 17 -67 30 -70 30 -16 0 -457 215 -592 288 -136 74 -291 165 -383 224 -15 10 -34 21 -42 25 -52 25 -563 381 -614 428 -12 11 -42 35 -66 54 -40 31 -258 211 -286 236 -238 214 -478 452 -696 692 -35 39 -153 179 -226 268 -37 45 -322 423 -337 447 -5 9 -44 67 -86 129 -75 113 -105 159 -124 191 -5 9 -35 59 -67 110 -65 108 -87 146 -121 208 -14 25 -41 74 -61 110 -83 152 -221 440 -296 620 -29 69 -58 139 -65 155 -7 17 -21 50 -30 75 -9 25 -23 60 -31 78 -8 18 -14 41 -14 50 0 10 -5 23 -11 29 -6 6 -14 26 -19 44 -8 32 -48 155 -75 229 -11 32 -19 58 -60 200 -30 103 -50 177 -89 338 -8 31 -20 80 -26 107 -7 28 -16 70 -20 95 -10 57 -28 147 -46 227 -8 34 -14 77 -14 95 0 18 -5 49 -11 68 -5 19 -14 71 -19 115 -14 129 -30 264 -41 350 -20 157 -31 555 -25 920 5 343 15 495 47 740 6 44 15 116 19 160 5 44 14 96 19 115 6 19 11 48 11 65 0 16 6 62 14 100 8 39 22 108 31 155 9 47 21 103 27 125 6 22 14 58 18 80 19 104 126 498 165 605 7 19 23 69 36 110 12 41 26 79 31 85 4 5 8 17 8 27 0 9 6 32 14 50 8 18 21 51 29 73 32 87 49 131 62 160 7 17 36 86 65 155 85 203 203 449 310 645 27 50 55 102 63 116 8 15 54 93 103 173 49 81 94 155 99 164 69 120 423 613 519 723 64 74 82 94 102 122 24 30 117 135 234 261 112 122 362 371 474 472 54 49 106 96 115 105 93 91 702 559 727 559 3 0 23 14 44 30 21 17 40 30 43 30 3 0 34 19 69 43 58 39 343 213 378 230 8 4 42 23 75 42 33 19 96 52 140 75 44 23 87 45 95 50 8 5 22 11 30 14 8 3 22 10 30 15 15 9 154 76 275 131 64 29 266 113 325 135 64 24 125 47 155 59 37 16 80 31 165 57 36 12 81 27 100 34 87 31 107 37 140 45 19 4 50 13 68 19 17 6 47 16 65 22 17 6 43 13 57 15 14 3 48 11 75 19 140 39 320 80 525 119 41 8 102 20 135 26 33 6 92 15 130 20 39 4 102 13 140 19 104 16 318 39 510 55 205 17 891 15 1095 -3z" />{" "}
                        <path d="M8835 13544 c-22 -2 -107 -8 -190 -14 -263 -19 -566 -75 -760 -142 -16 -5 -43 -13 -60 -18 -54 -15 -226 -78 -290 -106 -154 -68 -273 -125 -335 -162 -19 -11 -53 -30 -75 -42 -22 -12 -59 -35 -83 -51 -24 -16 -45 -29 -47 -29 -8 0 -101 -65 -200 -139 -219 -164 -431 -363 -599 -562 -76 -90 -280 -369 -299 -409 -4 -8 -16 -28 -27 -45 -11 -16 -24 -39 -30 -50 -6 -11 -22 -40 -36 -65 -28 -48 -108 -205 -130 -255 -7 -16 -25 -57 -40 -90 -15 -32 -30 -71 -35 -85 -4 -14 -17 -50 -29 -80 -12 -30 -25 -68 -30 -85 -5 -16 -13 -43 -18 -60 -6 -16 -17 -55 -26 -85 -8 -30 -22 -80 -30 -110 -28 -102 -73 -340 -81 -425 -3 -33 -10 -91 -15 -130 -16 -115 -12 -571 5 -735 17 -156 39 -311 56 -400 6 -30 15 -77 19 -105 4 -27 13 -72 20 -100 6 -27 18 -76 26 -107 33 -136 46 -185 56 -213 5 -16 13 -46 17 -65 4 -19 13 -45 19 -57 7 -12 12 -30 12 -41 0 -11 7 -33 15 -48 8 -16 15 -38 15 -49 0 -11 7 -29 15 -39 8 -11 15 -28 15 -38 0 -9 6 -32 14 -50 14 -33 36 -90 61 -158 96 -260 297 -676 481 -995 19 -33 39 -69 44 -80 6 -11 18 -32 28 -47 16 -25 126 -201 147 -236 85 -142 524 -759 555 -782 4 -3 31 -36 61 -75 29 -38 56 -72 61 -76 4 -3 25 -28 45 -55 21 -28 61 -77 89 -110 29 -32 82 -95 120 -139 38 -44 85 -98 105 -120 20 -22 62 -69 94 -105 33 -36 82 -90 109 -120 63 -68 560 -565 641 -641 60 -55 168 -129 235 -160 83 -38 112 -49 130 -49 10 0 45 -7 77 -15 187 -49 463 16 648 154 33 24 177 162 320 306 258 260 307 310 420 435 32 36 74 83 94 105 100 110 384 447 474 560 95 120 315 412 370 490 95 135 231 334 242 353 6 9 21 33 35 52 26 36 42 61 60 95 6 11 18 32 28 47 41 63 154 253 196 330 16 29 36 64 43 78 124 223 273 527 343 700 28 70 49 117 66 153 8 16 14 36 14 45 0 9 7 26 15 36 8 11 15 28 15 37 0 10 6 30 14 46 15 30 33 80 46 128 5 17 14 46 21 65 6 19 17 51 24 70 7 19 19 60 28 90 8 30 22 80 30 110 9 30 18 66 21 80 3 14 10 45 16 70 36 139 59 247 70 335 4 33 13 92 19 130 73 463 48 1041 -65 1463 -45 169 -74 262 -90 294 -8 14 -14 33 -14 42 0 8 -7 32 -16 53 -25 56 -45 104 -59 138 -18 44 -174 355 -195 390 -11 17 -25 40 -32 52 -55 95 -280 411 -308 433 -4 3 -37 41 -75 85 -179 210 -515 498 -733 630 -9 6 -36 23 -59 38 -24 15 -45 27 -47 27 -3 0 -22 12 -43 26 -21 14 -60 37 -88 50 -27 14 -57 29 -65 34 -31 18 -248 117 -315 142 -22 9 -58 23 -80 31 -22 9 -65 24 -95 33 -30 9 -70 23 -88 30 -18 8 -40 14 -48 14 -9 0 -37 7 -63 15 -98 30 -260 65 -416 89 -149 23 -515 47 -600 40z m215 -2075 c36 -5 94 -14 130 -19 36 -5 79 -13 95 -18 17 -6 55 -18 85 -27 236 -71 466 -217 644 -407 109 -117 171 -206 241 -348 20 -41 41 -83 46 -92 13 -26 39 -98 49 -138 5 -19 13 -53 19 -75 35 -139 41 -190 41 -359 0 -175 -11 -270 -45 -377 -8 -26 -15 -54 -15 -63 0 -14 -6 -30 -45 -121 -83 -193 -171 -329 -300 -463 -217 -227 -477 -373 -775 -435 -192 -41 -468 -41 -604 -1 -26 8 -56 14 -65 14 -47 0 -319 113 -416 173 -73 45 -223 168 -291 238 -126 131 -181 210 -260 369 -117 238 -154 397 -154 665 0 329 73 566 265 855 70 106 269 303 379 375 144 93 330 181 436 204 19 5 53 13 75 19 22 6 81 16 130 22 50 7 97 13 105 15 36 7 171 4 230 -6z" />{" "}
                      </g>{" "}
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {personalInfo?.houseNumber} {personalInfo?.barangay}
                    </span>
                    <span className="text-sm opacity-70">
                      {personalInfo?.city} {personalInfo?.country}
                    </span>
                  </div>
                </div>

                <div className="flex lg:flex-row flex-col px-5 gap-3 justify-between pb-5">
                  <div className="basis-1/2 gap-2 rounded-sm flex flex-col">
                    <span className="text-sm font-medium">Country</span>
                    <div className="rounded-sm px-3 py-2 border">
                      {personalInfo?.country || "N/A"}
                    </div>
                  </div>
                  <div className="basis-1/2 gap-2 rounded-sm flex flex-col">
                    <span className="text-sm font-medium">City</span>
                    <div className="rounded-sm px-3 py-2 border">
                      {personalInfo?.city || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-row flex-col px-5 gap-3 justify-between pb-5">
                  <div className="basis-full gap-2 rounded-sm flex flex-col">
                    <span className="text-sm font-medium">Barangay</span>
                    <div className="rounded-sm px-3 py-2 border">
                      {personalInfo?.barangay || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-row flex-col px-5 gap-3 justify-between pb-5">
                  <div className="basis-full gap-2 rounded-sm flex flex-col">
                    <span className="text-sm font-medium">House Number</span>
                    <div className="rounded-sm px-3 py-2 border">
                      {personalInfo?.houseNumber || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </section>
  
        </div>
        {isImageOpen && (
          <div
            className={`${
              closing ? styles.backdropOut : styles.backdropIn
            } fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4`}
            onClick={handleClose}
          >
            {/* Stop closing when clicking the image */}
            <div
              className={`relative max-w-4xl w-full flex justify-center ${
                closing ? styles.modalOut : styles.modalIn
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={
                  personalInfo?.profileImage ||
                  user?.avatar ||
                  "images/userIcon.png"
                }
                alt="Profile Large"
                className="max-h-[90vh] rounded-xl shadow-2xl"
              />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute -top-3 -right-3 bg-foreground text-background rounded-full w-8 h-8 font-bold shadow cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
