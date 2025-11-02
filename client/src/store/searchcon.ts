import { atom } from 'recoil';
import { SearchState } from './search';

export const searchcon = atom<SearchState>({
  key: 'searchcon',
  default: {
    enabled: null,
    query: '',
    debouncedQuery: '',
    isSearching: false,
    isTyping: false,
  },
});

export default {
  searchcon,
};
