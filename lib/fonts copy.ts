import { Geist, Geist_Mono, Roboto_Slab, Nunito } from "next/font/google";

export const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const robotoSlab = Roboto_Slab({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-roboto-slab',
    display: 'swap',
});

export const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const nunito = Nunito({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-nunito',
    display: 'swap',
});