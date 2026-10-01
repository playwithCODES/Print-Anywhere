import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "PrintAnywhere",
  description: "Remote printing platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
        >
          {`
            (function () {
              try {
                const theme =
                  localStorage.getItem("theme");

                if (theme === "light") {
                  document.documentElement.classList.remove(
                    "dark"
                  );
                } else {
                  document.documentElement.classList.add(
                    "dark"
                  );
                }
              } catch (error) {
                document.documentElement.classList.add(
                  "dark"
                );
              }
            })();
          `}
        </Script>
      </head>

      <body
        className="
          bg-slate-100
          text-slate-900
          transition-colors
          duration-300
          dark:bg-slate-950
          dark:text-white
        "
      >
        {children}
      </body>
    </html>
  );
}