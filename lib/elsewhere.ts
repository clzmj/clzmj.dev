export type PhotoSize = { file: string; width: number; height: number };

export type ElsewherePhoto = {
  id: string;
  caption: string;
  focal: { x: number; y: number };
  objectPosition: string;
  src: string;
  width: number;
  height: number;
  color: string;
  sizes: PhotoSize[];
};
