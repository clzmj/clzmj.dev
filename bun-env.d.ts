declare const Bun: {
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
