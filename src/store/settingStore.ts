import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingState {
  isMusicPlaying: boolean;
  musicVolume: number;
  toggleMusic: () => void;
  setMusicVolume: (vol: number) => void;
}

const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      isMusicPlaying: false,
      musicVolume: 0.5,
      toggleMusic: () => set((state) => ({ isMusicPlaying: !state.isMusicPlaying })),
      setMusicVolume: (vol) => set({ musicVolume: vol }),
    }),
    { name: 'settings-storage' }
  )
);

export default useSettingStore;
