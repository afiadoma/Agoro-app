import "./globals.css";
import RegisterSW from "./RegisterSW";

export const metadata = {
  title: "Agoro",
  description: "Find bakers, caterers and suppliers near you. Ask the market anything.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Agoro",
  },
};

export const viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#FFFFFF" }}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
