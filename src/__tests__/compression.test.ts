import { describe, expect, it } from 'vitest';
import {
  compressData,
  decompressData,
  type OptimizedData,
  optimizeData,
  restoreData,
} from '../utils/compression';

describe('Compression & Optimization Utility', () => {
  const sampleData = {
    ownedApostles: [
      { id: 'ner', asideLevel: 1 },
      { id: 'vivi', asideLevel: 0 }, // 0 level (should be optimized out)
    ],
  };

  describe('Optimization (optimizeData & restoreData)', () => {
    it('should shorten keys and remove default values', () => {
      const optimized = optimizeData(sampleData);

      // Short key mapping check
      expect(optimized).toHaveProperty('o');
      expect(optimized.o[0]).toHaveProperty('i', 'ner');
      expect(optimized.o[0]).toHaveProperty('a', 1);

      // Default value optimization check (asideLevel 0 should be removed)
      expect(optimized.o[1]).toHaveProperty('i', 'vivi');
      expect(optimized.o[1]).not.toHaveProperty('a');
    });

    it('should restore data perfectly to original format', () => {
      const optimized = optimizeData(sampleData);
      const restored = restoreData(optimized);

      expect(restored).toEqual(sampleData);
      expect(restored.ownedApostles[1].asideLevel).toBe(0); // Restored from undefined
    });

    it('should handle empty data safely', () => {
      const emptyData = { ownedApostles: [] };
      const optimized = optimizeData(emptyData);
      expect(optimized.o).toEqual([]);
      expect(restoreData(optimized)).toEqual(emptyData);
    });
  });

  describe('Compression (compressData & decompressData)', () => {
    it('should compress and decompress optimized data correctly', () => {
      const optimized = optimizeData(sampleData);
      const compressed = compressData(optimized);

      expect(typeof compressed).toBe('string');
      // EncodedURIComponent typically starts with 'N4Ig' for JSON objects
      expect(compressed.length).toBeGreaterThan(0);

      const decompressed = decompressData<OptimizedData>(compressed);
      expect(decompressed).not.toBeNull();
      expect(decompressed).toEqual(optimized);

      const restored = restoreData(decompressed!);
      expect(restored).toEqual(sampleData);
    });

    it('should return null for invalid compressed data', () => {
      const result = decompressData('invalid-data-@#$%');
      expect(result).toBeNull();
    });
  });

  it('should handle large data sets and show significant reduction', () => {
    const largeData = {
      ownedApostles: Array.from({ length: 300 }, (_, i) => ({
        id: `apostle-${i}`,
        asideLevel: i % 2 === 0 ? 0 : (i % 3) + 1, // Half are 0
      })),
    };

    const originalJson = JSON.stringify(largeData);
    const optimized = optimizeData(largeData);
    const compressed = compressData(optimized);

    const originalSize = originalJson.length;
    const compressedSize = compressed.length; // ASCII-like, 1 byte per char roughly

    console.log(`Original JSON size: ${originalSize} chars`);
    console.log(`Optimized + Compressed size: ${compressedSize} chars`);

    // Should be significantly smaller (at least 50% reduction for this data)
    expect(compressedSize).toBeLessThan(originalSize * 0.6);

    // Full cycle check
    const decompressed = decompressData<OptimizedData>(compressed);
    expect(decompressed).not.toBeNull();
    const restored = restoreData(decompressed!);
    expect(restored).toEqual(largeData);
  });
});
