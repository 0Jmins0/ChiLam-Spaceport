import {
  Inter,
  Noto_Sans_SC,
  Noto_Serif_SC,
  Playfair_Display,
  Cormorant_Garamond,
} from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans',
});

export const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-serif',
});

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

export const fontVariables = [
  inter.variable,
  notoSansSC.variable,
  notoSerifSC.variable,
  playfairDisplay.variable,
  cormorantGaramond.variable,
].join(' ');
