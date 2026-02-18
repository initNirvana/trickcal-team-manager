import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { OwnedApostle } from '@/stores/myApostleStore';
import { useMyApostleStore } from '@/stores/myApostleStore';
import { useCloudSync } from '../hooks/useCloudSync';

// Mock dependencies
vi.mock('@/lib/supabase');
vi.mock('@/stores/authStore');
vi.mock('@/stores/myApostleStore');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
}));

type ChainResult = { data: unknown; error: unknown };

describe('useCloudSync', () => {
  const mockUser = { id: 'test-user', email: 'test@example.com' };

  // Chain result state
  let chainResult: ChainResult = { data: [], error: null };

  // Mock functions
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();
  const mockInsert = vi.fn();
  const mockEq = vi.fn();

  const setOwnedApostlesSpy = vi.fn();
  let currentOwnedApostles: OwnedApostle[] = [];

  // Helper to create a fresh Promise-based chain that resolves immediately
  const createMockChain = () => {
    // Create a native Promise that resolves to the current chainResult
    const promise = Promise.resolve(chainResult);

    // Attach mock methods to the promise instance (Mixin pattern)
    Object.assign(promise, {
      select: mockSelect.mockReturnValue(promise),
      order: mockOrder.mockReturnValue(promise),
      insert: mockInsert.mockReturnValue(promise),
      eq: mockEq.mockReturnValue(promise),
    });

    return promise;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset chain result and store state
    chainResult = { data: [], error: null };
    currentOwnedApostles = [];

    // Zustand Store Mocks
    (useAuthStore as unknown as Mock).mockReturnValue({ user: mockUser });

    (useMyApostleStore as unknown as Mock).mockImplementation(() => ({
      ownedApostles: currentOwnedApostles,
      setOwnedApostles: setOwnedApostlesSpy,
    }));

    (useMyApostleStore as unknown as { getState: Mock }).getState = vi
      .fn()
      .mockImplementation(() => ({
        ownedApostles: currentOwnedApostles,
      }));

    // Setup Supabase Mock to return a NEW chain promise on each call
    (supabase.from as unknown as Mock).mockImplementation(() => createMockChain());
  });

  it('should fetch backups on mount', async () => {
    const mockBackups = [{ id: '1', created_at: '2023-01-01', data: { ownedApostles: [] } }];
    chainResult = { data: mockBackups, error: null };

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result.current.backups).toEqual(mockBackups);
    });
  });

  it('should auto-restore when local data is empty and server has data', async () => {
    // 1. Local is empty
    currentOwnedApostles = [];

    // 2. Server has data
    const serverData = { ownedApostles: [{ id: 'apostle-1', asideLevel: 2 }] };
    const mockBackups = [{ id: '1', created_at: '2023-01-01', data: serverData }];
    chainResult = { data: mockBackups, error: null };

    renderHook(() => useCloudSync());

    await waitFor(() => {
      // Should call setOwnedApostles with server data
      expect(setOwnedApostlesSpy).toHaveBeenCalledWith(serverData.ownedApostles);
    });
  });

  it('should NOT auto-restore if local data exists', async () => {
    // 1. Local has data
    currentOwnedApostles = [{ id: 'apostle-local', asideLevel: 1 }];

    // 2. Server has different data
    const serverData = { ownedApostles: [{ id: 'apostle-server', asideLevel: 2 }] };
    const mockBackups = [{ id: '1', created_at: '2023-01-01', data: serverData }];
    chainResult = { data: mockBackups, error: null };

    renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(mockSelect).toHaveBeenCalled();
      // Should NOT call setOwnedApostles
      expect(setOwnedApostlesSpy).not.toHaveBeenCalled();
    });
  });

  it('should auto-restore from COMPRESSED server data', async () => {
    const { compressData } = await import('@/utils/compression');

    // 1. Local is empty
    currentOwnedApostles = [];

    // 2. Server has COMPRESSED data
    const rawData = { ownedApostles: [{ id: 'apostle-compressed', asideLevel: 3 }] };
    const compressed = compressData(rawData);
    const mockBackups = [{ id: '1', created_at: '2023-01-01', data: { c: compressed } }];
    chainResult = { data: mockBackups, error: null };

    renderHook(() => useCloudSync());

    await waitFor(() => {
      // Should decompress and call setOwnedApostles with original data
      expect(setOwnedApostlesSpy).toHaveBeenCalledWith(rawData.ownedApostles);
    });
  });
});
