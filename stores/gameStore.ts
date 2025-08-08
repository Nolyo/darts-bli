import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Game from "../models/game";
import Player from "../models/player";
import {
  showError,
  showSuccess,
  showWarning,
  showInfo,
} from "../utils/notifications";

interface GameState {
  currentGame: Game | null;
  isLoading: boolean;
  error: string | null;
  // Settings
  checkoutHelpEnabled: boolean;
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  preferDarkTheme: boolean;
}

interface GameActions {
  // Game management
  loadGame: (id: string) => Promise<void>;
  createNewGame: () => Game;
  startGame: () => Promise<void>;
  resetGame: () => Promise<void>;
  saveGame: () => Promise<void>;

  // Game actions
  addDart: (score: number, multiplier: number) => Promise<void>;
  removeLastDart: () => Promise<void>;
  nextPlayer: () => Promise<void>;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearGame: () => void;

  // Settings
  setCheckoutHelpEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setSoundsEnabled: (enabled: boolean) => void;
  setPreferDarkTheme: (enabled: boolean) => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentGame: null,
      isLoading: false,
      error: null,
      checkoutHelpEnabled: true,
      hapticsEnabled: false,
      soundsEnabled: true,
      preferDarkTheme: false,

      // Actions
      loadGame: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const gameData = await Game.getByIdFromStorage(id);
          if (!gameData || !gameData.id) {
            throw new Error("Partie introuvable");
          }

          const game = new Game();
          game.hydrate(gameData);

          set({ currentGame: game, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          showError("Erreur", error.message);
          throw error;
        }
      },

      createNewGame: () => {
        const game = new Game();
        set({ currentGame: game, error: null });
        return game;
      },

      startGame: async () => {
        const { currentGame } = get();
        if (!currentGame) {
          throw new Error("Aucune partie en cours");
        }

        set({ isLoading: true });

        try {
          await currentGame.start();
          set({ isLoading: false });
          showSuccess("Partie démarrée !");
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          showError("Impossible de démarrer", error.message);
          throw error;
        }
      },

      resetGame: async () => {
        const { currentGame } = get();
        if (!currentGame) return;

        try {
          await currentGame.resetGame();
          showInfo("Partie remise à zéro");
        } catch (error: any) {
          showError("Erreur lors de la remise à zéro", error.message);
        }
      },

      saveGame: async () => {
        const { currentGame } = get();
        if (!currentGame) return;

        try {
          await currentGame.save();
        } catch (error: any) {
          showError("Erreur de sauvegarde", error.message);
        }
      },

      addDart: async (score: number, multiplier: number) => {
        const { currentGame, saveGame } = get();
        if (!currentGame) return;

        try {
          await currentGame.addDart(score, multiplier);
          // Batch save lightly: immediate feedback, save shortly after
          set({ currentGame });
          setTimeout(() => {
            get().saveGame();
          }, 150);

          const totalScore = score * multiplier;
          if (totalScore > 0) {
            showSuccess(`${totalScore} points marqués !`);
          }
        } catch (error: any) {
          showError("Impossible d&apos;ajouter le score", error.message);
        }
      },

      removeLastDart: async () => {
        const { currentGame, saveGame } = get();
        if (!currentGame) return;

        try {
          await currentGame.removeLastDart();
          set({ currentGame });
          setTimeout(() => {
            get().saveGame();
          }, 150);
          showInfo("Dernière fléchette supprimée");
        } catch (error: any) {
          showError("Impossible de supprimer", error.message);
        }
      },

      nextPlayer: async () => {
        const { currentGame, saveGame } = get();
        if (!currentGame) return;

        try {
          const currentPlayerName = currentGame.currentPlayer()?.getName();
          await currentGame.nextPlayer();
          // Force une mise à jour de l'état pour déclencher un re-render
          set({ currentGame });
          await saveGame();

          const nextPlayerName = currentGame.currentPlayer()?.getName();
          if (nextPlayerName) {
            showInfo(`Au tour de ${nextPlayerName}`);
          }
        } catch (error: any) {
          showError("Impossible de passer au joueur suivant", error.message);
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearGame: () => {
        set({ currentGame: null, error: null, isLoading: false });
      },

      setCheckoutHelpEnabled: (enabled: boolean) =>
        set({ checkoutHelpEnabled: enabled }),
      setHapticsEnabled: (enabled: boolean) => set({ hapticsEnabled: enabled }),
      setSoundsEnabled: (enabled: boolean) => set({ soundsEnabled: enabled }),
      setPreferDarkTheme: (enabled: boolean) =>
        set({ preferDarkTheme: enabled }),
    }),
    {
      name: "darts-bli-settings",
      storage: createJSONStorage(() => AsyncStorage),
      // On ne persiste que les préférences
      partialize: (state) => ({
        checkoutHelpEnabled: state.checkoutHelpEnabled,
        hapticsEnabled: state.hapticsEnabled,
        soundsEnabled: state.soundsEnabled,
        preferDarkTheme: state.preferDarkTheme,
      }),
    }
  )
);
