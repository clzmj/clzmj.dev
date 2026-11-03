interface BunImagePipeline {
  metadata(): Promise<{ width: number; height: number; format: string }>;
  resize(
    width: number,
    height: number,
    options?: { fit?: 'inside' | 'fill'; withoutEnlargement?: boolean },
  ): BunImagePipeline;
  png(): BunImagePipeline;
  webp(options: { quality: number }): BunImagePipeline;
  bytes(): Promise<Uint8Array>;
}

declare const Bun: {
  version: string;
  Image: new (input: string | Uint8Array | Blob) => BunImagePipeline;
  file: (path: string) => Blob & { exists: () => Promise<boolean> };
  serve: (options: {
    port: number;
    fetch: (request: Request) => Response | Promise<Response>;
  }) => unknown;
  spawn: (
    command: string[],
    options: {
      env?: Record<string, string | undefined>;
      stdout?: 'inherit';
      stderr?: 'inherit';
    },
  ) => { kill: () => void };
};
