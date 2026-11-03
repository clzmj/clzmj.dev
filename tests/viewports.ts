export type Viewport = {
  name: string;
  width: number;
  height: number;
};

export const viewports: Viewport[] = [
  { name: '375', width: 375, height: 812 },
  { name: '390', width: 390, height: 844 },
  { name: '393', width: 393, height: 852 },
  { name: '402', width: 402, height: 874 },
  { name: '430', width: 430, height: 932 },
  { name: '440', width: 440, height: 956 },
  { name: '744', width: 744, height: 1133 },
  { name: '820', width: 820, height: 1180 },
  { name: '834', width: 834, height: 1194 },
  { name: '1032', width: 1032, height: 1376 },
  { name: '744-landscape', width: 1133, height: 744 },
  { name: '820-landscape', width: 1180, height: 820 },
  { name: '834-landscape', width: 1194, height: 834 },
  { name: '1032-landscape', width: 1376, height: 1032 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1512', width: 1512, height: 982 },
  { name: '1920', width: 1920, height: 1080 },
  { name: '2560', width: 2560, height: 1440 },
];

export const shotPages = [
  { name: 'home', path: '/' },
  { name: 'writings', path: '/writings' },
  { name: 'markdown-demo', path: '/writings/markdown-demo' },
  { name: 'events', path: '/events' },
  { name: 'example-evening', path: '/events/example-evening' },
];
