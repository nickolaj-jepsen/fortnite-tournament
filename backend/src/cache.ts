import { CacheContainer } from "node-ts-cache";
import { MemoryStorage } from "node-ts-cache-storage-memory";

export const statsCache = new CacheContainer(new MemoryStorage());
