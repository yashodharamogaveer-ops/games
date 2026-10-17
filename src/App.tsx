/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameWorld, GameStateSnapshot } from './game/GameWorld.ts';
import { GameSettings, RoomId, InteractiveObject } from './game/types.ts';
import { GameHUD } from './components/GameHUD.tsx';
import { MapHUD } from './components/MapHUD.tsx';
import { PuzzleModal } from './components/PuzzleModal.tsx';
import { InventoryModal } from './components/InventoryModal.tsx';
import { DocumentModal } from './components/DocumentModal.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { VictoryModal } from './components/VictoryModal.tsx';
import { PauseMenu } from './components/PauseMenu.tsx';
import { ExhibitionLeaderboard } from './components/ExhibitionLeaderboard.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { HowToPlayModal } from './components/HowToPlayModal.tsx';
import { MainMenu } from './components/MainMenu.tsx';
import { MapSystem } from './game/MapSystem.ts';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const gameWorldRef = useRef<GameWorld | null>(null);

  // Game UI Flow States
  const [inGame, setInGame] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Modals
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);
  const [activeDocument, setActiveDocument] = useState<{ title: string; content: string } | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Dynamic HUD tracking state
  const [currentRoom, setCurrentRoom] = useState<RoomId>('bedroom');
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([-4, 1.7, 20]);
  const [playerYaw, setPlayerYaw] = useState<number>(0);
  const [hackerState, setHackerState] = useState<string>('PATROL');
  const [alertLevel, setAlertLevel] = useState<number>(0);
  const [objective, setObjective] = useState<string>('Search the bedroom for an escape route and the hidden blueprint map');
  const [focusedInteractive, setFocusedInteractive] = useState<InteractiveObject | null>(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [capturesCount, setCapturesCount] = useState(0);
  const [hackerStrikes, setHackerStrikes] = useState(0);

  // Banner toast
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'info' | 'warning' | 'success' } | null>(null);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    mouseSensitivity: 1.2,
    masterVolume: 0.7,
    mapPosition: 'right',
    difficulty: 'normal',
    challengeTimeLimit: 0,
    flashlightEnabled: true,
  });

  // Show banner helper
  const showBanner = (text: string, type: 'info' | 'warning' | 'success' = 'info') => {
    setBannerMessage({ text, type });
    setTimeout(() => {
      setBannerMessage((cur) => (cur?.text === text ? null : cur));
    }, 4000);
  };

  // Initialize GameWorld once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const gw = new GameWorld(canvasMountRef.current, settings);
    gameWorldRef.current = gw;

    // Attach GameWorld callbacks
    gw.onStateChange = (snap: GameStateSnapshot) => {
      setCurrentRoom(snap.playerRoom);
      setPlayerPos(snap.playerPos);
      setPlayerYaw(snap.playerYaw);
      setHackerState(snap.hackerState);
      setAlertLevel(snap.alertLevel);
      setFocusedInteractive(snap.focusedInteractive);
      setObjective(snap.currentObjective);
      setIsFlashlightOn(gw.playerController.isFlashlightOn);
      setPuzzlesSolved(gw.puzzlesSolvedCount);
      setTimeElapsed(gw.timeElapsed);
      setHackerStrikes(snap.hackerStrikes);
    };

    gw.onOpenPuzzle = (puzzleId: string) => {
      setActivePuzzleId(puzzleId);
      gw.playerController.unlockPointer();
    };

    gw.onReadDocument = (title: string, content: string) => {
      setActiveDocument({ title, content });
      gw.playerController.unlockPointer();
    };

    gw.onBannerAlert = (msg: string, type?: 'info' | 'warning' | 'success') => {
      showBanner(msg, type || 'info');
    };

    gw.onCaptured = () => {
      setIsCaptured(true);
      setCapturesCount(gw.capturesCount);
    };

    gw.onVictory = () => {
      setIsVictory(true);
      setTimeElapsed(gw.timeElapsed);
      setPuzzlesSolved(gw.puzzlesSolvedCount);
    };

    return () => {
      gw.destroy();
      gameWorldRef.current = null;
    };
  }, []);

  // Keyboard shortcut listener for UI toggles
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!inGame) return;

      // Escape key handles closing modals or pausing
      if (e.code === 'Escape') {
        if (activePuzzleId) {
          setActivePuzzleId(null);
          gameWorldRef.current?.playerController.requestPointerLock();
          return;
        }
        if (activeDocument) {
          setActiveDocument(null);
          gameWorldRef.current?.playerController.requestPointerLock();
          return;
        }
        if (showInventory) {
          setShowInventory(false);
          gameWorldRef.current?.playerController.requestPointerLock();
          return;
        }
        if (showHowToPlay) {
          setShowHowToPlay(false);
          return;
        }
        if (showSettings) {
          setShowSettings(false);
          return;
        }
        if (showLeaderboard) {
          setShowLeaderboard(false);
          return;
        }

        // Toggle pause
        if (!isCaptured && !isVictory) {
          if (!isPaused) {
            gameWorldRef.current?.pause();
            setIsPaused(true);
          } else {
            gameWorldRef.current?.resume();
            setIsPaused(false);
            gameWorldRef.current?.playerController.requestPointerLock();
          }
        }
      }

      // Tab key toggles inventory
      if (e.code === 'Tab') {
        e.preventDefault();
        if (!isPaused && !isCaptured && !isVictory && !activePuzzleId && !activeDocument) {
          setShowInventory((prev) => {
            const next = !prev;
            if (next) {
              gameWorldRef.current?.playerController.unlockPointer();
            } else {
              gameWorldRef.current?.playerController.requestPointerLock();
            }
            return next;
          });
        }
      }

      // M key toggles map
      if (e.code === 'KeyM') {
        MapSystem.getInstance().toggleVisibility();
      }

      // R key restart prompt
      if (e.code === 'KeyR' && !activePuzzleId && !activeDocument && isPaused) {
        handleRestartRun();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [inGame, isPaused, isCaptured, isVictory, activePuzzleId, activeDocument, showInventory, showHowToPlay, showSettings, showLeaderboard]);

  const handleStartGame = (challengeLimitSeconds = 0) => {
    const updatedSettings = {
      ...settings,
      challengeTimeLimit: challengeLimitSeconds,
    };
    setSettings(updatedSettings);
    gameWorldRef.current?.setSettings(updatedSettings);
    gameWorldRef.current?.restartRun();
    gameWorldRef.current?.start();

    setInGame(true);
    setIsPaused(false);
    setIsCaptured(false);
    setIsVictory(false);
    setActivePuzzleId(null);
    setActiveDocument(null);
    setShowInventory(false);

    // Request pointer lock on canvas
    setTimeout(() => {
      gameWorldRef.current?.playerController.requestPointerLock();
    }, 150);
  };

  const handleResumeGame = () => {
    setIsPaused(false);
    gameWorldRef.current?.resume();
    gameWorldRef.current?.playerController.requestPointerLock();
  };

  const handleRestartRun = () => {
    setIsPaused(false);
    setIsCaptured(false);
    setIsVictory(false);
    setActivePuzzleId(null);
    setActiveDocument(null);
    setShowInventory(false);

    gameWorldRef.current?.restartRun();
    gameWorldRef.current?.resume();
    setTimeout(() => {
      gameWorldRef.current?.playerController.requestPointerLock();
    }, 150);
  };

  const handleQuitToMainMenu = () => {
    gameWorldRef.current?.stop();
    setInGame(false);
    setIsPaused(false);
    setIsCaptured(false);
    setIsVictory(false);
    setActivePuzzleId(null);
    setActiveDocument(null);
    setShowInventory(false);
  };

  const handleToggleFlashlight = () => {
    gameWorldRef.current?.playerController.toggleFlashlight();
    setIsFlashlightOn(!!gameWorldRef.current?.playerController.isFlashlightOn);
  };

  const handleUseEMP = () => {
    gameWorldRef.current?.useEMP();
  };

  const handleCanvasClick = () => {
    // If running in game and no modal open, request pointer lock
    if (
      inGame &&
      !isPaused &&
      !isCaptured &&
      !isVictory &&
      !activePuzzleId &&
      !activeDocument &&
      !showInventory &&
      !showSettings &&
      !showHowToPlay &&
      !showLeaderboard
    ) {
      gameWorldRef.current?.playerController.requestPointerLock();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Container Mount */}
      <div
        ref={canvasMountRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 z-0 cursor-crosshair w-full h-full"
      />

      {/* Main Menu Screen (if not in game) */}
      {!inGame && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* In-Game HUD Elements */}
      {inGame && (
        <>
          <GameHUD
            objective={objective}
            timeElapsed={timeElapsed}
            puzzlesSolved={puzzlesSolved}
            alertLevel={alertLevel}
            hackerState={hackerState}
            hackerStrikes={hackerStrikes}
            focusedInteractive={focusedInteractive}
            isFlashlightOn={isFlashlightOn}
            difficulty={settings.difficulty}
            challengeTimeLimit={settings.challengeTimeLimit}
            bannerMessage={bannerMessage}
            onToggleFlashlight={handleToggleFlashlight}
            onUseEMP={handleUseEMP}
            onPause={() => {
              gameWorldRef.current?.pause();
              setIsPaused(true);
            }}
            onOpenInventory={() => {
              setShowInventory(true);
              gameWorldRef.current?.playerController.unlockPointer();
            }}
          />

          {/* Real-time Dynamic Map HUD */}
          <MapHUD
            playerPos={playerPos}
            playerYaw={playerYaw}
            currentRoom={currentRoom}
            hackerPos={
              alertLevel > 40 || hackerState === 'CHASE'
                ? [
                    gameWorldRef.current?.hackerAI.position.x || 0,
                    0,
                    gameWorldRef.current?.hackerAI.position.z || 0,
                  ]
                : undefined
            }
            hackerState={hackerState}
            positionSide={settings.mapPosition}
          />
        </>
      )}

      {/* Interactive Terminal / Door Keypad Puzzle Modal */}
      {activePuzzleId && (
        <PuzzleModal
          puzzleId={activePuzzleId}
          onClose={() => {
            setActivePuzzleId(null);
            gameWorldRef.current?.playerController.requestPointerLock();
          }}
          onSolved={(pid) => {
            gameWorldRef.current?.onPuzzleSolved(pid);
          }}
          onFailed={(pid) => {
            gameWorldRef.current?.onPuzzleFailed(pid);
          }}
        />
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <InventoryModal
          onClose={() => {
            setShowInventory(false);
            gameWorldRef.current?.playerController.requestPointerLock();
          }}
          onUseEMP={handleUseEMP}
          onOpenDocument={(title, content) => {
            setShowInventory(false);
            setActiveDocument({ title, content });
          }}
        />
      )}

      {/* Document / Notes Inspection Modal */}
      {activeDocument && (
        <DocumentModal
          title={activeDocument.title}
          content={activeDocument.content}
          onClose={() => {
            setActiveDocument(null);
            gameWorldRef.current?.playerController.requestPointerLock();
          }}
        />
      )}

      {/* Pause Menu */}
      {isPaused && (
        <PauseMenu
          onResume={handleResumeGame}
          onRestart={handleRestartRun}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenSettings={() => setShowSettings(true)}
          onMainMenu={handleQuitToMainMenu}
        />
      )}

      {/* Captured / Game Over Modal */}
      {isCaptured && (
        <GameOverModal
          timeElapsed={timeElapsed}
          puzzlesSolved={puzzlesSolved}
          capturesCount={capturesCount}
          onRetry={handleRestartRun}
          onMainMenu={handleQuitToMainMenu}
        />
      )}

      {/* Victory Escape Modal */}
      {isVictory && (
        <VictoryModal
          timeElapsed={timeElapsed}
          puzzlesSolved={puzzlesSolved}
          capturesCount={capturesCount}
          difficulty={settings.difficulty}
          onPlayAgain={handleRestartRun}
          onViewLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            gameWorldRef.current?.setSettings(newSettings);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* How To Play Briefing Modal */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      {/* Exhibition Leaderboard Modal */}
      {showLeaderboard && (
        <ExhibitionLeaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}
