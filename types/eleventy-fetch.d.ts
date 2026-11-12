// Minimal types for the parts of @11ty/eleventy-fetch this repo uses.
declare module "@11ty/eleventy-fetch" {
  export class AssetCache {
    constructor(key: string, cacheDirectory?: string, options?: Record<string, unknown>);
    isCacheValid(duration: string): boolean;
    getCachedValue(): Promise<any>;
    save(contents: unknown, type?: "json" | "text" | "buffer"): Promise<void>;
  }
}
