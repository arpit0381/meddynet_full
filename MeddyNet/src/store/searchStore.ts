import { create } from 'zustand';

interface SearchState {
  query: string;
  setQuery: (q: string) => void;
  category: string;
  setCategory: (c: string) => void;
  showFilters: boolean;
  setShowFilters: (s: boolean) => void;
  viewMode: 'split' | 'list';
  setViewMode: (v: 'split' | 'list') => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  setQuery: (q) => set({ query: q }),
  category: 'All',
  setCategory: (c) => set({ category: c }),
  showFilters: false,
  setShowFilters: (s) => set({ showFilters: s }),
  viewMode: 'split',
  setViewMode: (v) => set({ viewMode: v }),
}));
