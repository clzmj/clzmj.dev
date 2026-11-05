export type PhotoSize = {
  file: string;
  width: number;
  height: number;
  quality: number;
  bytes: number;
};
export type OmittedPhotoSize = {
  width: number;
  budget: number;
  attempts: { quality: number; bytes: number }[];
};

export type ElsewherePhoto = {
  id: string;
  caption: string;
  alt: string;
  focal: { x: number; y: number };
  objectPosition: string;
  src: string;
  width: number;
  height: number;
  color: string;
  sourceWidth: number;
  sourceHeight: number;
  sizes: PhotoSize[];
  omitted?: OmittedPhotoSize[];
};
