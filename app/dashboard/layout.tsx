import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JCSGO: Dashboard",
  description: "A Site for Systematic Discipleship",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        {children}
</div>
  );
}
