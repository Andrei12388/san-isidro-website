
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

export const DEVOTIONS_DATA: DevotionItem[] = [
  {
    id: 1,
    title: "Morning Gratitude",
    image: "images/devotion1.jpeg",
    message: "Start your day by thanking God for the gift of life. Before checking your phone or rushing into responsibilities, pause for a moment of prayer. Gratitude shifts your heart from stress to peace and reminds you that every breath is a blessing and every sunrise is another chance to grow.",
    verse: "Psalm 118:24 — This is the day the Lord has made; we will rejoice and be glad in it.",
    heart: 12,
    heartActive: false,
    comments: "Very inspiring!"
  },
  {
    id: 2,
    title: "Faith Over Fear",
    image: "images/devotion2.jpeg",
    message: "Trust God even when the path is unclear and the future feels uncertain. Fear whispers doubts, but faith speaks promises. Remember that God goes before you, preparing the way, so step forward confidently knowing you are never walking alone.",
    verse: "Isaiah 41:10 — Do not fear, for I am with you; do not be dismayed, for I am your God.",
    heart: 18,
    heartActive: false,
    comments: "Needed this today."
  },
  {
    id: 3,
    title: "Kindness Matters",
    image: "images/devotion3.jpeg",
    message: "A small act of kindness can change someone's entire day. A smile, a gentle word, or a helping hand reflects God's love more than we realize. When we choose kindness, we become instruments of hope in a hurting world.",
    verse: "Ephesians 4:32 — Be kind and compassionate to one another.",
    heart: 9,
    heartActive: false,
    comments: "So true!"
  },
  {
    id: 4,
    title: "Power of Prayer",
    image: "images/devotion4.jpeg",
    message: "Prayer connects us directly to God's heart. It is not about fancy words but honest conversations. When you pray, you lay down your burdens and invite God's strength into your weakness and His peace into your chaos.",
    verse: "Philippians 4:6 — Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.",
    heart: 25,
    heartActive: false,
    comments: "Amen"
  },
  {
    id: 5,
    title: "Stay Positive",
    image: "images/devotion5.jpg",
    message: "Choose hope even during difficult times. Life will have storms, but positivity rooted in faith keeps you steady. Fix your eyes on God's promises instead of your problems and watch your mindset transform.",
    verse: "Romans 12:12 — Be joyful in hope, patient in affliction, faithful in prayer.",
    heart: 14,
    heartActive: false,
    comments: "Love this message."
  },
  {
    id: 6,
    title: "Serve Others",
    image: "images/devotion6.jpeg",
    message: "Serving others is serving God. Every time you help someone without expecting anything back, you reflect Christ's humility. True greatness is found not in being served but in serving with love.",
    verse: "Mark 10:45 — The Son of Man did not come to be served, but to serve.",
    heart: 11,
    heartActive: false,
    comments: "Great reminder."
  },
  {
    id: 7,
    title: "Peace Within",
    image: "images/devotion7.jpg",
    message: "Find peace by surrendering your worries to God. Stop carrying burdens you were never meant to hold. When you release control and trust Him fully, your heart becomes calm even when life is noisy.",
    verse: "John 14:27 — Peace I leave with you; my peace I give you.",
    heart: 17,
    heartActive: false,
    comments: "So calming."
  },
  {
    id: 8,
    title: "Daily Strength",
    image: "images/devotion8.jpg",
    message: "God gives strength to those who seek Him daily. Even when you feel weak or tired, His grace is enough. Lean on Him and you will discover a strength that goes beyond your own ability.",
    verse: "Isaiah 40:31 — Those who hope in the Lord will renew their strength.",
    heart: 20,
    heartActive: false,
    comments: "Very uplifting."
  },
  {
    id: 9,
    title: "Be Thankful",
    image: "images/devotion9.jpg",
    message: "Gratitude turns what we have into enough. Instead of focusing on what is missing, celebrate what is present. A thankful heart sees miracles in ordinary moments and joy in simple blessings.",
    verse: "1 Thessalonians 5:18 — Give thanks in all circumstances.",
    heart: 7,
    heartActive: false,
    comments: "Thank you for this."
  },
  {
    id: 10,
    title: "Light the Way",
    image: "images/devotion10.jpg",
    message: "Let your light shine before others through your actions and words. Darkness cannot overcome even the smallest light. Be the person who encourages, uplifts, and points others toward hope.",
    verse: "Matthew 5:16 — Let your light shine before others.",
    heart: 13,
    heartActive: false,
    comments: "Beautiful thought."
  },
  {
    id: 11,
    title: "Forgive Freely",
    image: "images/devotion11.jpg",
    message: "Forgiveness frees your heart from heavy burdens. Holding onto anger only traps you in pain. When you forgive, you choose healing and allow God to restore peace inside your soul.",
    verse: "Colossians 3:13 — Forgive as the Lord forgave you.",
    heart: 16,
    heartActive: false,
    comments: "Hard but important."
  },
  {
    id: 12,
    title: "Walk in Love",
    image: "images/devotion12.jpg",
    message: "Love others the way Christ loves you — patiently, gently, and without conditions. Love is the greatest testimony of faith. Through love, people see God working through your life.",
    verse: "1 Corinthians 16:14 — Let all that you do be done in love.",
    heart: 22,
    heartActive: false,
    comments: "Love this verse!"
  },
  {
    id: 13,
    title: "Hope Always",
    image: "images/devotion13.jpg",
    message: "Hope is the anchor of the soul during life's storms. Even when everything seems lost, God is still working behind the scenes. Hold onto hope because better days are ahead.",
    verse: "Hebrews 6:19 — We have this hope as an anchor for the soul.",
    heart: 8,
    heartActive: false,
    comments: "Very meaningful."
  },
  {
    id: 14,
    title: "Trust the Plan",
    image: "images/devotion14.jpg",
    message: "God's plans are always better than ours even when they don't make sense. Delays are not denials. Trust His timing and believe that every step is leading you exactly where you need to be.",
    verse: "Jeremiah 29:11 — For I know the plans I have for you, declares the Lord.",
    heart: 19,
    heartActive: false,
    comments: "Trusting Him daily."
  },
  {
    id: 15,
    title: "Evening Reflection",
    image: "images/devotion15.jpg",
    message: "End the day with reflection and prayer. Look back at the blessings, lessons, and small victories. Thank God for guiding you through the day and rest peacefully knowing tomorrow is in His hands.",
    verse: "Psalm 4:8 — In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety.",
    heart: 10,
    heartActive: false,
    comments: "Perfect before bed."
  }
];