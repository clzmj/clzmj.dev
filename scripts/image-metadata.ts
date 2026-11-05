import { Buffer } from 'node:buffer';

// Parse image containers, rather than trusting extensions or searching compressed pixels.
// Reject unsupported image formats so a new format cannot silently bypass the audit.
export function imageMetadataChunks(bytes: Uint8Array): string[] {
  const data = Buffer.from(bytes);
  const tags: string[] = [];
  if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    for (let offset = 8; offset + 12 <= data.length;) {
      const length = data.readUInt32BE(offset);
      if (offset + length + 12 > data.length) throw new Error('Truncated PNG chunk');
      const type = data.toString('ascii', offset + 4, offset + 8);
      if (['eXIf', 'tEXt', 'zTXt', 'iTXt'].includes(type)) tags.push(type);
      offset += length + 12;
    }
    return tags;
  }
  if (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') {
    for (let offset = 12; offset + 8 <= data.length;) {
      const type = data.toString('ascii', offset, offset + 4);
      const length = data.readUInt32LE(offset + 4);
      if (offset + 8 + length > data.length) throw new Error('Truncated WebP chunk');
      if (['EXIF', 'XMP ', 'ICCP'].includes(type)) tags.push(type.trim());
      offset += 8 + length + (length % 2);
    }
    return tags;
  }
  if (data[0] === 0xff && data[1] === 0xd8) {
    let offset = 2;
    while (offset < data.length) {
      if (data[offset++] !== 0xff) throw new Error('Invalid JPEG marker');
      while (data[offset] === 0xff) offset += 1;
      const marker = data[offset++];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
      const length = data.readUInt16BE(offset);
      if (length < 2 || offset + length > data.length) throw new Error('Truncated JPEG marker');
      if (marker === 0xe1) tags.push('APP1 (EXIF/XMP, including GPS)');
      if (marker === 0xed) tags.push('APP13 (IPTC)');
      if (marker === 0xfe) tags.push('COM');
      offset += length;
    }
    return tags;
  }
  throw new Error('Unsupported image format: add a container metadata audit before publishing it');
}
