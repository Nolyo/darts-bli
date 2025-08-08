import { useCallback, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { GameModeType, FinishType } from '../types';
import Player from '../models/player';

export const useGame = (gameId?: string) => {
  const {
    currentGame,
    isLoading,
    error,
    loadGame,
    createNewGame,
    startGame,
    resetGame,
    saveGame,
    addDart,
    removeLastDart,
    nextPlayer,
    clearGame,
  } = useGameStore();

  // Load game effect
  useEffect(() => {
    if (gameId && gameId !== currentGame?.id) {
      loadGame(gameId);
    }
  }, [gameId, currentGame?.id, loadGame]);

  // Game management functions
  const handleCreateGame = useCallback(() => {
    return createNewGame();
  }, [createNewGame]);

  const handleStartGame = useCallback(async () => {
    if (!currentGame) return false;
    try {
      await startGame();
      return true;
    } catch {
      return false;
    }
  }, [currentGame, startGame]);

  const handleResetGame = useCallback(async () => {
    await resetGame();
  }, [resetGame]);

  const handleSaveGame = useCallback(async () => {
    await saveGame();
  }, [saveGame]);

  // Game actions
  const handleAddDart = useCallback(async (score: number, multiplier: number) => {
    await addDart(score, multiplier);
  }, [addDart]);

  const handleRemoveLastDart = useCallback(async () => {
    await removeLastDart();
  }, [removeLastDart]);

  const handleNextPlayer = useCallback(async () => {
    await nextPlayer();
  }, [nextPlayer]);

  // Game configuration
  const setGameType = useCallback((type: GameModeType) => {
    if (!currentGame) return;
    currentGame.setType(type);
  }, [currentGame]);

  const setFinishType = useCallback(async (type: FinishType) => {
    if (!currentGame) return;
    currentGame.setTypesFinish(type);
    await saveGame();
  }, [currentGame, saveGame]);

  const setFinishAtFirst = useCallback(async (value: boolean) => {
    if (!currentGame) return;
    currentGame.setFinishAtFirst(value);
    await saveGame();
  }, [currentGame, saveGame]);

  // Player management
  const addPlayer = useCallback((name?: string) => {
    if (!currentGame) return null;
    
    const player = new Player(
      currentGame.getNextPlayerId(),
      currentGame.type === 'Capital' ? 1000 : parseInt(currentGame.type)
    );
    
    if (name) {
      player.setName(name);
    }
    
    currentGame.addPlayer(player);
    return player;
  }, [currentGame]);

  // Game state getters
  const canPlay = currentGame?.playerCanPlay() ?? false;
  const hasAgainDart = currentGame?.playerHasAgainDart() ?? false;
  const hasOverScore = currentGame?.playerHasOverScore() ?? false;
  const currentPlayer = currentGame?.currentPlayer() ?? null;
  const nextPlayerToPlay = currentGame?.getNextPlayerToPlay() ?? null;
  const currentPlayerInRow = currentGame?.getCurrentPlayerInRow() ?? null;
  const gameRows = currentGame?.getRows() ?? [];
  const players = currentGame?.getPlayers() ?? [];
  const ranking = currentGame?.ranking ?? [];
  const gameStatus = currentGame?.status ?? 'pending';
  const gameType = currentGame?.type ?? '501';
  const finishType = currentGame?.finishType ?? 'classic';
  const isFinishAtFirst = currentGame?.isFinishAtFirst ?? false;

  return {
    // State
    game: currentGame,
    isLoading,
    error,
    
    // Game info
    gameId: currentGame?.id,
    gameStatus,
    gameType,
    finishType,
    isFinishAtFirst,
    players,
    ranking,
    gameRows,
    
    // Current game state
    currentPlayer,
    nextPlayerToPlay,
    currentPlayerInRow,
    canPlay,
    hasAgainDart,
    hasOverScore,
    
    // Actions
    createGame: handleCreateGame,
    startGame: handleStartGame,
    resetGame: handleResetGame,
    saveGame: handleSaveGame,
    addDart: handleAddDart,
    removeLastDart: handleRemoveLastDart,
    nextPlayer: handleNextPlayer,
    
    // Configuration
    setGameType,
    setFinishType,
    setFinishAtFirst,
    
    // Player management
    addPlayer,
    
    // Cleanup
    clearGame,
  };
};