// The prepared Cookie source encodes to 577,370 bytes at 2400px/q80,
// keeping the existing 600 KB cap without changing any other photo or size.
export function photoQuality(id: string, width: number): number {
  return id === '02' && width === 2400 ? 80 : 85;
}
