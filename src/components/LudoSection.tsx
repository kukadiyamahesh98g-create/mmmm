import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlayerColor, GameScreen, TokenState, MoveOption } from '../types/ludo';
import { getValidMoves, checkPlayerFinished, getMovementPath, calculateFairDiceRoll } from '../lib/ludoEngine';
import { selectBestAiMove } from '../lib/ludoAi';
import { soundEngine } from '../lib/soundEngine';
import { LudoBoardView } from './Ludo/LudoBoardView';
import {
  Gamepad2,
  Trophy,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Shield,
  HelpCircle,
  X,
  RotateCcw,
  Send,
  CheckCircle2,
  Coins,
  LogOut,
  ArrowLeft,
  Mic,
  MicOff,
  UserCheck,
  Lock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdModal } from './AdModal';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { OfflineOverlay } from './OfflineOverlay';

const HUMAN_LIKE_NAMES = [
  'Parvat', 'Mahesh', 'Kajal', 'Rahul', 'Priya', 'Amit', 'Sunita', 'Rajesh',
  'Ananya', 'Deepak', 'Neha', 'Suresh', 'Pooja', 'Vijay', 'Anita', 'Rohit',
  'Sneha', 'Aarav', 'Diya', 'Arjun', 'Ishita', 'Sanjay', 'Ritu', 'Vikram',
  'Kavya', 'Manish', 'Simran', 'Rohan', 'Nisha', 'Sachin', 'Swati', 'Gaurav',
  'Meera', 'Karan', 'Pankaj', 'Anjali', 'Manoj', 'Divya', 'Sandeep', 'Aarti',
  'Bhavna', 'Komal', 'Kiran', 'Rekha', 'Shruti', 'Suman', 'Ankit', 'Vishal'
];

const generateOpponentNames = (): Record<PlayerColor, string> => {
  const shuffled = [...HUMAN_LIKE_NAMES].sort(() => 0.5 - Math.random());
  return {
    red: shuffled[0],
    green: shuffled[1],
    yellow: shuffled[2],
    blue: shuffled[3],
  };
};

interface LudoSectionProps {
  onOpenAuth: () => void;
  onBack?: () => void;
}

export const LudoSection: React.FC<LudoSectionProps> = ({ onOpenAuth, onBack }) => {
  const { currentUser, addCoins } = useAuth();

  // Screen state
  const [screen, setScreen] = useState<GameScreen>('splash');

  // Game Mode Configuration: '1v1' (Me vs 1 Player) or '1v3' (Me vs 3 Players) or 'custom' (Pass & Play with Friends / AI)
  const [gameMode, setGameMode] = useState<'1v1' | '1v3' | 'custom'>('1v3');
  const [customPlayerCount, setCustomPlayerCount] = useState<2 | 3 | 4>(2);
  const [customPlayerTypes, setCustomPlayerTypes] = useState<Record<PlayerColor, 'friend' | 'ai'>>({
    red: 'friend',
    green: 'friend',
    yellow: 'friend',
    blue: 'ai',
  });
  const [customFriendNames, setCustomFriendNames] = useState<Record<PlayerColor, string>>({
    red: 'Friend 1',
    green: 'Friend 1',
    yellow: 'Friend 2',
    blue: 'Friend 3',
  });
  const [playerTypes, setPlayerTypes] = useState<Record<PlayerColor, 'human' | 'friend' | 'ai'>>({
    red: 'human',
    green: 'ai',
    yellow: 'ai',
    blue: 'ai',
  });
  const [activeColors, setActiveColors] = useState<PlayerColor[]>(['red', 'green', 'yellow', 'blue']);

  // Helper to determine active colors for match setup
  const getActiveColors = (
    mode: '1v1' | '1v3' | 'custom',
    count: number,
    mainColor: PlayerColor
  ): PlayerColor[] => {
    if (mode === '1v1') {
      return [mainColor, getOpponentColor(mainColor)];
    }
    if (mode === '1v3') {
      return ['red', 'green', 'yellow', 'blue'];
    }
    if (count === 2) {
      return [mainColor, getOpponentColor(mainColor)];
    }
    if (count === 3) {
      const ALL: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
      const idx = ALL.indexOf(mainColor);
      return [mainColor, ALL[(idx + 1) % 4], ALL[(idx + 2) % 4]];
    }
    return ['red', 'green', 'yellow', 'blue'];
  };

  // Player configuration
  const [humanColor, setHumanColor] = useState<PlayerColor>('red');
  const [activeTurn, setActiveTurn] = useState<PlayerColor>('red');

  // Opponent display names state
  const [opponentNames, setOpponentNames] = useState<Record<PlayerColor, string>>(() => generateOpponentNames());

  // Lifelines & Elimination State (5 Lifelines per player)
  const [lifelines, setLifelines] = useState<Record<PlayerColor, number>>({
    red: 5,
    green: 5,
    yellow: 5,
    blue: 5,
  });

  const [eliminated, setEliminated] = useState<Record<PlayerColor, boolean>>({
    red: false,
    green: false,
    yellow: false,
    blue: false,
  });

  // Turn state
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [turnStatusText, setTurnStatusText] = useState<string>('Tap your dice to start!');

  // Match Ranking Order
  const [finishedRankings, setFinishedRankings] = useState<PlayerColor[]>([]);

  // Refs for managing AI delay
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tokens state
  const [tokens, setTokens] = useState<Record<PlayerColor, TokenState[]>>({
    red: [
      { id: 0, color: 'red', position: -1 },
      { id: 1, color: 'red', position: -1 },
      { id: 2, color: 'red', position: -1 },
      { id: 3, color: 'red', position: -1 },
    ],
    green: [
      { id: 0, color: 'green', position: -1 },
      { id: 1, color: 'green', position: -1 },
      { id: 2, color: 'green', position: -1 },
      { id: 3, color: 'green', position: -1 },
    ],
    yellow: [
      { id: 0, color: 'yellow', position: -1 },
      { id: 1, color: 'yellow', position: -1 },
      { id: 2, color: 'yellow', position: -1 },
      { id: 3, color: 'yellow', position: -1 },
    ],
    blue: [
      { id: 0, color: 'blue', position: -1 },
      { id: 1, color: 'blue', position: -1 },
      { id: 2, color: 'blue', position: -1 },
      { id: 3, color: 'blue', position: -1 },
    ],
  });

  // Valid moves for active player
  const [validMoves, setValidMoves] = useState<MoveOption[]>([]);

  // Fairness & Streak tracking state
  const [turnsWithoutSix, setTurnsWithoutSix] = useState<Record<PlayerColor, number>>({
    red: 0,
    green: 0,
    yellow: 0,
    blue: 0,
  });

  // Sound state
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  // Modals & Rules & Chat Claim State
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [humanPlace, setHumanPlace] = useState<number>(1); // 1st, 2nd, 3rd, 4th
  const [wasHumanEliminated, setWasHumanEliminated] = useState<boolean>(false);
  const [chatClaimMessage, setChatClaimMessage] = useState<string>('');
  const [hasClaimedReward, setHasClaimedReward] = useState<boolean>(false);
  const [isRewardUnlocked, setIsRewardUnlocked] = useState<boolean>(false);
  const [claimStatusText, setClaimStatusText] = useState<string>('');

  // Ad & Connectivity state
  const { isOnline, checkOnline } = useOnlineStatus();
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [adPendingAction, setAdPendingAction] = useState<'start_ludo' | 'claim_reward' | null>(null);
  const [offlineError, setOfflineError] = useState<string | null>(null);

  const handleStartLudoWithAd = async () => {
    const online = await checkOnline();
    if (!online) {
      setOfflineError('Internet connection is required to watch ad and play Ludo.');
      return;
    }
    setOfflineError(null);
    setAdPendingAction('start_ludo');
    setShowAdModal(true);
  };

  const handleClaimRewardWithAd = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (hasClaimedReward || wasHumanEliminated) return;

    const online = await checkOnline();
    if (!online) {
      setClaimStatusText('⚠️ Internet connection is required to watch ad and claim reward.');
      return;
    }
    setClaimStatusText('');
    setAdPendingAction('claim_reward');
    setShowAdModal(true);
  };

  const handleAdClosed = () => {
    setShowAdModal(false);
    if (adPendingAction === 'claim_reward') {
      setClaimStatusText('⚠️ Ad was closed early or skipped. Watch the full ad to unlock your coins.');
    }
    setAdPendingAction(null);
  };

  const handleExecuteClaimReward = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (hasClaimedReward || wasHumanEliminated) return;

    const prize = getRewardForPlace(humanPlace);
    if (prize <= 0) return;

    try {
      await addCoins(
        prize,
        'ludo_win',
        `Ludo ${gameMode === '1v1' ? '1v1' : 'Championship'} ${
          humanPlace === 1 ? '1st' : humanPlace === 2 ? '2nd' : humanPlace === 3 ? '3rd' : '4th'
        } Place Reward (+${prize} Coins)`
      );
      setHasClaimedReward(true);
      setIsRewardUnlocked(true);
      setClaimStatusText(`🎉 Ad completed! +${prize} Coins claimed successfully!`);
    } catch (err) {
      console.error('Error adding Ludo reward coins:', err);
      setClaimStatusText('⚠️ Error crediting coins. Please try again.');
    }
  };

  const handleAdFinished = () => {
    setShowAdModal(false);
    if (adPendingAction === 'start_ludo') {
      initGameMatch(humanColor);
      setScreen('play');
    } else if (adPendingAction === 'claim_reward') {
      setIsRewardUnlocked(true);
      handleExecuteClaimReward();
    }
    setAdPendingAction(null);
  };

  // Sound mute sync
  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  const toggleMic = () => {
    const nextMic = !isMicMuted;
    setIsMicMuted(nextMic);
    toggleSound();
  };

  const TURN_SEQUENCE: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

  // Helper to get opposite corner opponent for 1v1 mode
  const getOpponentColor = (color: PlayerColor): PlayerColor => {
    switch (color) {
      case 'red':
        return 'yellow';
      case 'green':
        return 'blue';
      case 'yellow':
        return 'red';
      case 'blue':
        return 'green';
    }
  };

  // Get next active non-eliminated and non-finished player
  const getNextActivePlayer = (
    currentTurn: PlayerColor,
    elimMap: Record<PlayerColor, boolean>,
    rankings: PlayerColor[] = finishedRankings,
    currentTokens: Record<PlayerColor, TokenState[]> = tokens
  ): PlayerColor | null => {
    const startIdx = TURN_SEQUENCE.indexOf(currentTurn);
    for (let i = 1; i <= 4; i++) {
      const candidate = TURN_SEQUENCE[(startIdx + i) % 4];
      const isElim = elimMap[candidate];
      const isFinished =
        rankings.includes(candidate) ||
        (currentTokens[candidate] && checkPlayerFinished(currentTokens[candidate]));
      if (!isElim && !isFinished) {
        return candidate;
      }
    }
    return null;
  };

  // Setup match reset
  const initGameMatch = (selectedHumanColor: PlayerColor) => {
    setHumanColor(selectedHumanColor);

    const activeCols = getActiveColors(gameMode, customPlayerCount, selectedHumanColor);
    setActiveColors(activeCols);

    const newPlayerTypes: Record<PlayerColor, 'human' | 'friend' | 'ai'> = {
      red: 'ai',
      green: 'ai',
      yellow: 'ai',
      blue: 'ai',
    };
    newPlayerTypes[selectedHumanColor] = 'human';

    activeCols.forEach((col) => {
      if (col !== selectedHumanColor) {
        if (gameMode === 'custom') {
          newPlayerTypes[col] = customPlayerTypes[col] || 'friend';
        } else {
          newPlayerTypes[col] = 'ai';
        }
      }
    });
    setPlayerTypes(newPlayerTypes);

    const generatedAiNames = generateOpponentNames();
    const newOpponentNames: Record<PlayerColor, string> = { ...generatedAiNames };

    let friendIdx = 1;
    activeCols.forEach((col) => {
      if (col === selectedHumanColor) {
        newOpponentNames[col] = 'You';
      } else if (newPlayerTypes[col] === 'friend') {
        const customName = customFriendNames[col]?.trim();
        newOpponentNames[col] = customName || `Friend ${friendIdx}`;
        friendIdx++;
      }
    });
    setOpponentNames(newOpponentNames);

    const initialEliminated: Record<PlayerColor, boolean> = {
      red: !activeCols.includes('red'),
      green: !activeCols.includes('green'),
      yellow: !activeCols.includes('yellow'),
      blue: !activeCols.includes('blue'),
    };

    const initialLifelines: Record<PlayerColor, number> = {
      red: initialEliminated.red ? 0 : 5,
      green: initialEliminated.green ? 0 : 5,
      yellow: initialEliminated.yellow ? 0 : 5,
      blue: initialEliminated.blue ? 0 : 5,
    };

    // First turn goes to human color or first active color
    const firstTurn = TURN_SEQUENCE.find((c) => !initialEliminated[c]) || selectedHumanColor;
    setActiveTurn(firstTurn);

    setDiceValue(null);
    setIsRolling(false);
    setIsAnimating(false);
    setTimeLeft(15);
    setConsecutiveSixes(0);
    setTurnsWithoutSix({ red: 0, green: 0, yellow: 0, blue: 0 });
    setValidMoves([]);
    setFinishedRankings([]);
    setWasHumanEliminated(false);
    setHasClaimedReward(false);
    setIsRewardUnlocked(false);
    setChatClaimMessage('');
    setClaimStatusText('');

    setLifelines(initialLifelines);
    setEliminated(initialEliminated);

    setTokens({
      red: [
        { id: 0, color: 'red', position: -1 },
        { id: 1, color: 'red', position: -1 },
        { id: 2, color: 'red', position: -1 },
        { id: 3, color: 'red', position: -1 },
      ],
      green: [
        { id: 0, color: 'green', position: -1 },
        { id: 1, color: 'green', position: -1 },
        { id: 2, color: 'green', position: -1 },
        { id: 3, color: 'green', position: -1 },
      ],
      yellow: [
        { id: 0, color: 'yellow', position: -1 },
        { id: 1, color: 'yellow', position: -1 },
        { id: 2, color: 'yellow', position: -1 },
        { id: 3, color: 'yellow', position: -1 },
      ],
      blue: [
        { id: 0, color: 'blue', position: -1 },
        { id: 1, color: 'blue', position: -1 },
        { id: 2, color: 'blue', position: -1 },
        { id: 3, color: 'blue', position: -1 },
      ],
    });

    setTurnStatusText(
      firstTurn === selectedHumanColor
        ? 'YOUR TURN - ROLL DICE'
        : `${(newOpponentNames[firstTurn] || firstTurn).toUpperCase()}'S TURN`
    );
    setScreen('play');
  };

  // 15-Second Turn Countdown Timer Interval
  useEffect(() => {
    if (screen !== 'play' || isRolling || isAnimating) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, activeTurn, diceValue, isRolling, isAnimating]);

  // Handle 15s Timer Expiration
  useEffect(() => {
    if (screen === 'play' && timeLeft === 0 && !isRolling && !isAnimating) {
      handleLifelineExpiration();
    }
  }, [timeLeft, screen, isRolling, isAnimating]);

  // Deduct lifeline when 15s expires
  const handleLifelineExpiration = () => {
    soundEngine.playCaptureSound();

    const currentLives = lifelines[activeTurn] - 1;
    const newLives = Math.max(0, currentLives);

    const updatedLifelines = { ...lifelines, [activeTurn]: newLives };
    setLifelines(updatedLifelines);

    if (newLives === 0) {
      // Eliminate player
      const updatedEliminated = { ...eliminated, [activeTurn]: true };
      setEliminated(updatedEliminated);
      setTurnStatusText(`💔 ${activeTurn.toUpperCase()} ELIMINATED!`);

      // Check remaining active players
      const activePlayers = TURN_SEQUENCE.filter((p) => !updatedEliminated[p]);

      if (activePlayers.length === 1) {
        // Match finished!
        setTimeout(() => {
          handleMatchEnd(activePlayers[0], updatedEliminated);
        }, 1200);
        return;
      } else if (activeTurn === humanColor) {
        // Human eliminated
        setWasHumanEliminated(true);
        setTimeout(() => {
          handleMatchEnd(null, updatedEliminated);
        }, 1200);
        return;
      }

      // Pass to next active player
      setTimeout(() => {
        switchTurn(false, updatedEliminated);
      }, 1200);
    } else {
      setTurnStatusText(`💔 ${activeTurn.toUpperCase()} LOST 1 LIFELINE! (${newLives} Left)`);
      setTimeout(() => {
        switchTurn(false, eliminated);
      }, 1200);
    }
  };

  // Roll Dice Action
  const handleRollDice = async () => {
    if (
      isRolling ||
      screen !== 'play' ||
      isAnimating ||
      eliminated[activeTurn] ||
      finishedRankings.includes(activeTurn) ||
      checkPlayerFinished(tokens[activeTurn])
    ) {
      return;
    }

    if (activeTurn === humanColor) {
      if (!isOnline) {
        setOfflineError('Internet connection is required to play Ludo.');
        return;
      }
    }
    soundEngine.playDiceSound();
    setIsRolling(true);
    setValidMoves([]);

    setTimeout(() => {
      // Third consecutive roll in a turn sequence is capped to 1..5 (never 6)
      const maxRollAllowed = consecutiveSixes >= 2 ? 5 : 6;
      const rolled = calculateFairDiceRoll(activeTurn, tokens, turnsWithoutSix, maxRollAllowed);
      setDiceValue(rolled);
      setIsRolling(false);
      setTimeLeft(15); // Reset 15s timer for move decision

      // Update streak counter for 6 rolls
      setTurnsWithoutSix((prev) => ({
        ...prev,
        [activeTurn]: rolled === 6 ? 0 : (prev[activeTurn] || 0) + 1,
      }));

      let currentSixes = consecutiveSixes;
      if (rolled === 6) {
        soundEngine.playSixRollSound();
        currentSixes += 1;
        setConsecutiveSixes(currentSixes);
      } else {
        setConsecutiveSixes(0);
      }

      const moves = getValidMoves(activeTurn, rolled, tokens);
      setValidMoves(moves);

      const isHumanControlled = playerTypes[activeTurn] !== 'ai';

      if (moves.length === 0) {
        if (rolled === 6) {
          setTurnStatusText(`🎲 ROLLED A 6! No valid move available. Extra turn granted!`);
          setTimeout(() => {
            setDiceValue(null);
            setTimeLeft(15);
            setIsRolling(false);
            setValidMoves([]);
          }, 1200);
        } else {
          setTurnStatusText(`No valid move for roll ${rolled}. Passing turn...`);
          setTimeout(() => switchTurn(false, eliminated), 1200);
        }
      } else if (moves.length === 1 && isHumanControlled) {
        setTurnStatusText(`Auto-moving token...`);
        setTimeout(() => executeMove(moves[0], rolled), 400);
      } else if (isHumanControlled) {
        setTurnStatusText(`Select a glowing token to move ${rolled} steps`);
      }
    }, 650);
  };

  // Execute Move Action with Smooth Step-by-Step Animation
  const executeMove = (move: MoveOption, rollForMove?: number) => {
    setValidMoves([]);
    setIsAnimating(true);
    const actualRoll = rollForMove !== undefined ? rollForMove : diceValue || 0;

    const path = getMovementPath(move.fromPos, move.toPos);
    let stepIdx = 0;

    const interval = setInterval(() => {
      if (stepIdx < path.length) {
        const nextPos = path[stepIdx];
        stepIdx++;

        soundEngine.playMoveSound();

        setTokens((prev) => {
          const nextToks = [...prev[activeTurn]];
          nextToks[move.tokenId] = {
            ...nextToks[move.tokenId],
            position: nextPos,
          };
          return { ...prev, [activeTurn]: nextToks };
        });

        if (stepIdx === path.length) {
          clearInterval(interval);
          setTimeout(() => {
            setTokens((latestAll) => {
              handlePostMoveEffects(move, latestAll, actualRoll);
              return latestAll;
            });
          }, 150);
        }
      } else {
        clearInterval(interval);
      }
    }, 220);
  };

  // Post Move Effects
  const handlePostMoveEffects = (
    move: MoveOption,
    latestTokens: Record<PlayerColor, TokenState[]>,
    actualRoll: number
  ) => {
    let extraTurnGranted = false;

    const continuePostMove = (extraTurn: boolean) => {
      const activePlayerTokens = latestTokens[activeTurn];
      const isWin = checkPlayerFinished(activePlayerTokens);

      let currentRankings = [...finishedRankings];

      if (isWin) {
        if (!currentRankings.includes(activeTurn)) {
          currentRankings.push(activeTurn);
          setFinishedRankings(currentRankings);
        }

        const rankPos = currentRankings.length;
        const ordinal = rankPos === 1 ? '1st' : rankPos === 2 ? '2nd' : rankPos === 3 ? '3rd' : '4th';
        soundEngine.playVictorySound();
        setTurnStatusText(`👑 ${getPlayerLabel(activeTurn).toUpperCase()} FINISHED IN ${ordinal} PLACE!`);

        setIsAnimating(false);

        // Find remaining unfinished and non-eliminated players
        const activeUnfinished = TURN_SEQUENCE.filter(
          (p) => !eliminated[p] && !currentRankings.includes(p) && !checkPlayerFinished(latestTokens[p])
        );

        if (activeUnfinished.length <= 1) {
          if (activeUnfinished.length === 1) {
            const lastPlayer = activeUnfinished[0];
            if (!currentRankings.includes(lastPlayer)) {
              currentRankings.push(lastPlayer);
            }
          }
          setTimeout(() => {
            handleMatchEnd(currentRankings[0], eliminated, currentRankings);
          }, 1200);
          return;
        } else {
          // Finished player's turn ends - DO NOT grant extra turn! Immediately pass turn.
          setTimeout(() => {
            switchTurn(false, eliminated, currentRankings, latestTokens);
          }, 1200);
          return;
        }
      }

      const isSixRoll = actualRoll === 6;
      const isHomePos = move.toPos === 56;

      if ((isSixRoll || isHomePos || extraTurn) && !extraTurnGranted) {
        extraTurnGranted = true;
      }

      if (extraTurnGranted) {
        if (isSixRoll) {
          setTurnStatusText(`🎲 ROLLED A 6! EXTRA TURN GRANTED!`);
        } else if (isHomePos) {
          setTurnStatusText(`🎉 TOKEN REACHED HOME! EXTRA TURN GRANTED!`);
        } else {
          setTurnStatusText(`💥 CAPTURED TOKEN! EXTRA TURN GRANTED!`);
        }
        setDiceValue(null);
        setTimeLeft(15);
        setIsAnimating(false);
        setValidMoves([]);
      } else {
        setIsAnimating(false);
        setConsecutiveSixes(0);
        switchTurn(false, eliminated, currentRankings, latestTokens);
      }
    };

    if (move.isCapture && move.captureColor !== undefined && move.captureTokenId !== undefined) {
      extraTurnGranted = true;
      const capCol = move.captureColor;
      const capId = move.captureTokenId;
      const startPos = latestTokens[capCol][capId].position;

      soundEngine.playCaptureSound();
      setTurnStatusText(`💥 CAPTURING ${capCol.toUpperCase()}'S TOKEN! RETURNING HOME...`);

      if (startPos > -1) {
        let currentPos = startPos;
        const returnInterval = setInterval(() => {
          currentPos--;
          soundEngine.playReturnStepSound();

          setTokens((prev) => {
            const oppToks = [...prev[capCol]];
            oppToks[capId] = {
              ...oppToks[capId],
              position: currentPos,
            };
            return { ...prev, [capCol]: oppToks };
          });

          if (currentPos <= -1) {
            clearInterval(returnInterval);
            setTimeout(() => {
              setTurnStatusText(`💥 CAPTURED ${capCol.toUpperCase()}'S TOKEN! EXTRA TURN!`);
              continuePostMove(extraTurnGranted);
            }, 100);
          }
        }, 35);
      } else {
        continuePostMove(extraTurnGranted);
      }
    } else {
      continuePostMove(extraTurnGranted);
    }
  };

  // Switch Turn
  const switchTurn = (
    isExtraTurn: boolean,
    currentEliminated: Record<PlayerColor, boolean>,
    currentRankings: PlayerColor[] = finishedRankings,
    currentTokens: Record<PlayerColor, TokenState[]> = tokens
  ) => {
    if (isExtraTurn) return;

    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }

    const nextTurn = getNextActivePlayer(activeTurn, currentEliminated, currentRankings, currentTokens);

    if (!nextTurn) {
      handleMatchEnd(currentRankings[0] || humanColor, currentEliminated, currentRankings);
      return;
    }

    setActiveTurn(nextTurn);
    setDiceValue(null);
    setConsecutiveSixes(0);
    setValidMoves([]);
    setTimeLeft(15);
    setIsAnimating(false);
    setIsRolling(false);

    setTurnStatusText(
      nextTurn === humanColor
        ? 'YOUR TURN - ROLL DICE'
        : playerTypes[nextTurn] === 'friend'
        ? `${getPlayerLabel(nextTurn).toUpperCase()}'S TURN (PASS & PLAY)`
        : `${getPlayerLabel(nextTurn).toUpperCase()}'S TURN`
    );
  };

  // AI Automation Loop
  useEffect(() => {
    const isAiTurn = playerTypes[activeTurn] === 'ai';

    if (
      screen !== 'play' ||
      !isAiTurn ||
      isRolling ||
      isAnimating ||
      eliminated[activeTurn] ||
      finishedRankings.includes(activeTurn) ||
      checkPlayerFinished(tokens[activeTurn])
    ) {
      return;
    }

    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }

    if (diceValue === null) {
      setTurnStatusText(`${getPlayerLabel(activeTurn).toUpperCase()} IS THINKING...`);
      const thinkDelay = 1000 + Math.floor(Math.random() * 500);
      aiTimerRef.current = setTimeout(() => {
        aiTimerRef.current = null;
        handleRollDice();
      }, thinkDelay);
    } else if (validMoves.length > 0) {
      const bestMove = selectBestAiMove(activeTurn, validMoves, tokens);
      if (bestMove) {
        setTurnStatusText(`${getPlayerLabel(activeTurn).toUpperCase()} CHOOSING MOVE...`);
        const thinkDelay = 1000 + Math.floor(Math.random() * 500);
        aiTimerRef.current = setTimeout(() => {
          aiTimerRef.current = null;
          executeMove(bestMove, diceValue ?? undefined);
        }, thinkDelay);
      }
    }

    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, [screen, activeTurn, diceValue, isRolling, isAnimating, validMoves, humanColor, tokens, eliminated, finishedRankings, playerTypes]);

  // Calculate Prize Amount based on Place
  const getRewardForPlace = (place: number): number => {
    const totalPlayers = gameMode === '1v1' ? 2 : gameMode === '1v3' ? 4 : customPlayerCount;
    if (totalPlayers === 2) {
      return place === 1 ? 5 : place === 2 ? 2 : 0;
    }
    if (totalPlayers === 3) {
      switch (place) {
        case 1:
          return 8;
        case 2:
          return 6;
        case 3:
          return 4;
        default:
          return 0;
      }
    }
    switch (place) {
      case 1:
        return 10;
      case 2:
        return 8;
      case 3:
        return 6;
      case 4:
        return 4;
      default:
        return 0;
    }
  };

  // Handle Match End
  const handleMatchEnd = async (
    winner: PlayerColor | null,
    elimMap: Record<PlayerColor, boolean>,
    rankList: PlayerColor[] = finishedRankings
  ) => {
    soundEngine.playVictorySound();

    const isHumanElim = elimMap[humanColor];
    setWasHumanEliminated(isHumanElim);

    let place = gameMode === '1v1' ? 2 : 4;
    if (!isHumanElim) {
      const idxInRanks = rankList.indexOf(humanColor);
      if (idxInRanks !== -1) {
        place = idxInRanks + 1;
      } else if (winner === humanColor) {
        place = 1;
      } else {
        place = rankList.length + 1;
      }
    }

    setHumanPlace(place);

    const prizeAmount = isHumanElim ? 0 : getRewardForPlace(place);

    // Lock reward until player watches rewarded ad
    setHasClaimedReward(false);
    setIsRewardUnlocked(false);

    if (!isHumanElim && prizeAmount > 0) {
      setChatClaimMessage(
        `Finished ${
          place === 1 ? '1st' : place === 2 ? '2nd' : place === 3 ? '3rd' : '4th'
        } place in Ludo!`
      );
      setClaimStatusText(`🔒 Reward Locked — Watch Ad to unlock your +${prizeAmount} Coins reward!`);
    } else {
      setClaimStatusText('');
    }

    if (place === 1 && !isHumanElim) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setScreen('win');
    } else {
      setScreen('lose');
    }
  };

  // Submit Chat Message Claim
  const handleSendChatClaim = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (hasClaimedReward || wasHumanEliminated) return;

    const online = await checkOnline();
    if (!online) {
      setClaimStatusText('⚠️ Internet connection is required to claim rewards.');
      return;
    }

    if (!chatClaimMessage.trim()) {
      setClaimStatusText('Please enter your claim message first!');
      return;
    }

    const prize = getRewardForPlace(humanPlace);
    if (prize <= 0) return;

    await addCoins(
      prize,
      'ludo_win',
      `Ludo Chat Claim (${humanPlace} Place, +${prize} Coins): "${chatClaimMessage}"`
    );

    setHasClaimedReward(true);
    setClaimStatusText(`🎉 Claim message sent! +${prize} Coins added to your account!`);
  };

  const getPlayerLabel = (col: PlayerColor): string => {
    if (col === humanColor) return 'You';
    if (!activeColors.includes(col)) return 'Inactive';
    if (playerTypes[col] === 'friend') {
      return opponentNames[col] || `Friend (${col.toUpperCase()})`;
    }
    return opponentNames[col] || 'Player';
  };

  if (!isOnline) {
    return (
      <OfflineOverlay
        onRetry={checkOnline}
        message="No Internet Connection. Please connect to continue"
        isInline={true}
      />
    );
  }

  return (
    <div className={`w-full flex flex-col justify-center items-center relative z-10 max-w-md mx-auto select-none px-1 ${screen === 'play' ? 'max-h-[100dvh] overflow-hidden touch-none py-0.5' : ''}`}>
      
      {/* 1. SINGLE UNIFIED SETUP SCREEN (SPLASH & HOME COMBINED) */}
      {(screen === 'splash' || screen === 'home') && (
        <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 text-center space-y-3.5 shadow-2xl flex flex-col items-center justify-center my-auto">
          {/* Header Branding */}
          <div className="flex items-center gap-3 text-left w-full border-b border-slate-800/80 pb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                5 LIFELINES ARENA
              </span>
              <h1 className="text-lg font-black italic uppercase tracking-tight text-white leading-tight">
                LUDO <span className="text-amber-400">CHAMPIONSHIP</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">
                15s Turn Timer • 5 Lifelines • Real Rewards
              </p>
            </div>
          </div>

          {/* 1. Game Mode Selector */}
          <div className="w-full space-y-1 text-left font-mono">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">
              1. Select Game Mode:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setGameMode('1v1');
                }}
                className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer text-center ${
                  gameMode === '1v1'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow scale-102'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="font-black text-[10px] uppercase tracking-tight">1 vs 1</span>
                <span className="text-[8px] text-slate-400">2 Players</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setGameMode('1v3');
                }}
                className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer text-center ${
                  gameMode === '1v3'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow scale-102'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="font-black text-[10px] uppercase tracking-tight">1 vs 3</span>
                <span className="text-[8px] text-slate-400">4 Players</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setGameMode('custom');
                }}
                className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer text-center ${
                  gameMode === 'custom'
                    ? 'border-amber-400 bg-amber-400/10 text-white shadow scale-102'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="font-black text-[10px] uppercase tracking-tight">Custom</span>
                <span className="text-[8px] text-amber-400 font-bold">Friendly Mode</span>
              </button>
            </div>
          </div>

          {/* Custom Mode Configuration Panel */}
          {gameMode === 'custom' && (
            <div className="w-full bg-slate-950/90 border border-amber-500/40 rounded-2xl p-3 space-y-2.5 font-mono text-[10px] text-left shadow-inner">
              <div className="flex items-center justify-between text-amber-400 font-bold uppercase tracking-wider">
                <span>🎮 CUSTOM PLAYER SETUP</span>
                <span className="text-[9px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Pass & Play
                </span>
              </div>

              {/* Custom Player Count */}
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">
                  Total Players in Match:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {([2, 3, 4] as const).map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        soundEngine.playButtonClick();
                        setCustomPlayerCount(count);
                      }}
                      className={`py-1.5 rounded-lg border text-center font-bold text-[10px] transition cursor-pointer ${
                        customPlayerCount === count
                          ? 'border-amber-400 bg-amber-400/20 text-white shadow'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {count} Players
                    </button>
                  ))}
                </div>
              </div>

              {/* Configure Opponent / Friend Seats */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">
                  Configure Opponent Seats:
                </span>

                {getActiveColors('custom', customPlayerCount, humanColor)
                  .filter((c) => c !== humanColor)
                  .map((col, idx) => {
                    const type = customPlayerTypes[col] || 'friend';
                    const name = customFriendNames[col] || `Friend ${idx + 1}`;
                    const isFriend = type === 'friend';

                    return (
                      <div
                        key={col}
                        className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border border-white/60 ${
                                col === 'red'
                                  ? 'bg-red-500'
                                  : col === 'green'
                                  ? 'bg-emerald-500'
                                  : col === 'yellow'
                                  ? 'bg-amber-400'
                                  : 'bg-sky-500'
                              }`}
                            />
                            <span className="font-black text-white text-[10px] uppercase">
                              Seat {idx + 2} ({col})
                            </span>
                          </div>

                          {/* Controller choice toggle */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playButtonClick();
                                setCustomPlayerTypes((prev) => ({ ...prev, [col]: 'friend' }));
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                                isFriend
                                  ? 'bg-amber-400 text-slate-950 font-black'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              👥 Friend
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playButtonClick();
                                setCustomPlayerTypes((prev) => ({ ...prev, [col]: 'ai' }));
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                                !isFriend
                                  ? 'bg-blue-500 text-white font-black'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              👤 Auto Player
                            </button>
                          </div>
                        </div>

                        {/* Name input if friend */}
                        {isFriend && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-[9px] text-slate-400 font-bold shrink-0">
                              Name:
                            </span>
                            <input
                              type="text"
                              maxLength={12}
                              value={name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomFriendNames((prev) => ({ ...prev, [col]: val }));
                              }}
                              placeholder={`Friend ${idx + 1}`}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-white font-bold text-[10px] focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 2. Dynamic Match Prize Pool */}
          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between text-amber-400 font-bold uppercase tracking-wider text-[10px]">
              <span>🏆 MATCH PRIZE POOL</span>
              <span className="text-[9px] text-slate-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                {gameMode === '1v1'
                  ? '1 vs 1'
                  : gameMode === '1v3'
                  ? '1 vs 3'
                  : `Custom ${customPlayerCount}P`}
              </span>
            </div>

            {(gameMode === '1v1' || (gameMode === 'custom' && customPlayerCount === 2)) ? (
              /* 2-Player Prize breakdown */
              <div className="grid grid-cols-2 gap-2 text-center font-bold text-slate-200">
                <div className="bg-amber-500/10 border border-amber-500/30 p-1.5 rounded-lg">
                  <span className="text-amber-400 block text-xs">🥇 1st Place</span>
                  <span className="text-white text-sm font-black">5 Coins</span>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 p-1.5 rounded-lg">
                  <span className="text-slate-300 block text-xs">🥈 2nd Place</span>
                  <span className="text-white text-sm font-black">2 Coins</span>
                </div>
              </div>
            ) : (gameMode === 'custom' && customPlayerCount === 3) ? (
              /* 3-Player Prize breakdown */
              <div className="grid grid-cols-3 gap-1.5 text-center font-bold text-slate-200">
                <div className="bg-amber-500/10 border border-amber-500/20 p-1 rounded-lg">
                  <span className="text-amber-400 block text-xs">🥇 1st</span>
                  <span className="text-white text-sm font-black">8 Coins</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 p-1 rounded-lg">
                  <span className="text-slate-300 block text-xs">🥈 2nd</span>
                  <span className="text-white text-sm font-black">6 Coins</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 p-1 rounded-lg">
                  <span className="text-amber-600 block text-xs">🥉 3rd</span>
                  <span className="text-white text-sm font-black">4 Coins</span>
                </div>
              </div>
            ) : (
              /* 4-Player Prize breakdown */
              <div className="grid grid-cols-4 gap-1 text-center font-bold text-slate-200">
                <div className="bg-amber-500/10 border border-amber-500/20 p-1 rounded">
                  <span className="text-amber-400 block">1st</span>
                  <span className="text-white">10 Coins</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 p-1 rounded">
                  <span className="text-slate-300 block">2nd</span>
                  <span className="text-white">8 Coins</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 p-1 rounded">
                  <span className="text-amber-600 block">3rd</span>
                  <span className="text-white">6 Coins</span>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 p-1 rounded">
                  <span className="text-slate-400 block">4th</span>
                  <span className="text-white">4 Coins</span>
                </div>
              </div>
            )}

            <p className="text-[9px] text-slate-400 text-center leading-tight">
              *Rewards given after match completion via Chat Claim. No reward if eliminated early.
            </p>
          </div>

          {/* 3. Token Color Selector */}
          <div className="w-full space-y-1 text-left font-mono">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">
              3. Select Token Color:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setHumanColor(c);
                  }}
                  className={`p-2 rounded-xl border-2 flex items-center justify-center gap-2 transition font-mono font-black uppercase text-xs cursor-pointer ${
                    humanColor === c
                      ? 'border-amber-400 bg-amber-400/10 text-white shadow scale-102'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border border-white/80 shrink-0 ${
                      c === 'red'
                        ? 'bg-red-500'
                        : c === 'green'
                        ? 'bg-emerald-500'
                        : c === 'yellow'
                        ? 'bg-amber-400'
                        : 'bg-sky-500'
                    }`}
                  />
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {offlineError && (
            <div className="w-full p-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs font-mono font-bold text-center">
              ⚠️ {offlineError}
            </div>
          )}

          {/* Direct Start Action Button */}
          <button
            onClick={handleStartLudoWithAd}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-widest rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Watch ad and play Ludo.</span>
          </button>
        </div>
      )}

      {/* 3. PLAY GAME SCREEN */}
      {screen === 'play' && (
        <div className="w-full flex flex-col items-center justify-between gap-1 touch-none overflow-hidden max-h-full">
          {/* Minimal Top Header with Pause Button */}
          <div className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  activeTurn === 'red'
                    ? 'bg-red-500'
                    : activeTurn === 'green'
                    ? 'bg-emerald-500'
                    : activeTurn === 'yellow'
                    ? 'bg-amber-400'
                    : 'bg-sky-500'
                } ${isRolling ? 'animate-ping' : ''}`}
              />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                {activeTurn} Turn
              </span>
            </div>

            <button
              onClick={() => setScreen('pause')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl transition flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer active:scale-95 shadow"
              title="Pause Game"
            >
              <Pause className="w-4 h-4 fill-amber-400" />
              <span>Pause</span>
            </button>
          </div>

          {/* Fully Responsive Ludo Board View */}
          <LudoBoardView
            tokens={tokens}
            activeColor={activeTurn}
            validMoves={validMoves}
            onSelectToken={(col, tokenId) => {
              const selectedMove = validMoves.find((m) => m.tokenId === tokenId);
              if (selectedMove) {
                executeMove(selectedMove, diceValue ?? undefined);
              }
            }}
            diceValue={diceValue}
            isRolling={isRolling}
            onRollDice={handleRollDice}
            playerLabels={{
              red: getPlayerLabel('red'),
              green: getPlayerLabel('green'),
              yellow: getPlayerLabel('yellow'),
              blue: getPlayerLabel('blue'),
            }}
            lifelines={lifelines}
            eliminated={eliminated}
            timeLeft={timeLeft}
            humanColor={humanColor}
            playerTypes={playerTypes}
          />

        </div>
      )}

      {/* 4. PAUSE MENU OVERLAY (Options: Resume, Restart, Mute Mic, Exit) */}
      {screen === 'pause' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xs w-full p-5 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-white">
              <Pause className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h3 className="text-base font-black italic uppercase font-mono tracking-wider">
                MATCH PAUSED
              </h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {/* Resume Button */}
              <button
                onClick={() => setScreen('play')}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Resume</span>
              </button>

              {/* Restart Button */}
              <button
                onClick={() => initGameMatch(humanColor)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 border border-slate-700"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Restart</span>
              </button>

              {/* Mute Mic / Unmute Mic Button */}
              <button
                onClick={toggleMic}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 border border-slate-700"
              >
                {isMicMuted ? (
                  <>
                    <MicOff className="w-4 h-4 text-red-400" />
                    <span>Unmute Mic</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>Mute Mic</span>
                  </>
                )}
              </button>

              {/* Exit Button */}
              <button
                onClick={() => {
                  if (onBack) {
                    onBack();
                  } else {
                    setScreen('splash');
                  }
                }}
                className="w-full py-2.5 bg-red-950/60 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider rounded-xl hover:bg-red-900/60 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MATCH COMPLETED (WIN / RANKING / REWARD DISPLAY) */}
      {(screen === 'win' || screen === 'lose') && (
        wasHumanEliminated ? (
          <div className="w-full max-w-sm bg-slate-900/95 border border-slate-800 rounded-3xl p-6 text-center space-y-6 shadow-2xl my-auto animate-in fade-in zoom-in-95">
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-inner">
                <span className="text-2xl">💔</span>
              </div>
              <h2 className="text-xl font-black italic uppercase text-red-400 tracking-wider">
                You are eliminated
              </h2>
            </div>

            <div className="flex flex-col gap-3 font-mono">
              <button
                onClick={() => initGameMatch(humanColor)}
                className="w-full py-3 px-5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-slate-950" />
                <span>Play again</span>
              </button>
              <button
                onClick={() => {
                  if (onBack) {
                    onBack();
                  } else {
                    setScreen('splash');
                  }
                }}
                className="w-full py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition cursor-pointer border border-slate-700 active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span>Exit lobby</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-5 text-center space-y-4 shadow-2xl my-auto">
            
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg">
              <Trophy className="w-7 h-7 fill-slate-950" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                MATCH COMPLETED
              </span>

              <div className="space-y-1">
                <h2 className="text-lg font-black italic uppercase text-white">
                  YOU FINISHED {humanPlace === 1 ? '1ST PLACE 👑' : humanPlace === 2 ? '2ND PLACE 🥈' : humanPlace === 3 ? '3RD PLACE 🥉' : '4TH PLACE'}
                </h2>
                <p className="text-xs text-amber-300 font-mono font-bold">
                  Rank Reward: +{getRewardForPlace(humanPlace)} Coins
                </p>
              </div>
            </div>

            {/* FINAL MATCH STANDINGS */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-left space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                🏆 Final Match Standings
              </span>

              <div className="space-y-1.5 font-mono text-xs">
                {TURN_SEQUENCE.filter((col) => !eliminated[col] || finishedRankings.includes(col))
                  .sort((a, b) => {
                    const idxA = finishedRankings.indexOf(a);
                    const idxB = finishedRankings.indexOf(b);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    if (idxA !== -1) return -1;
                    if (idxB !== -1) return 1;
                    return 0;
                  })
                  .map((col, i) => {
                    const isHuman = col === humanColor;
                    const rankNum = i + 1;
                    const rankLabel = rankNum === 1 ? '🥇 1st' : rankNum === 2 ? '🥈 2nd' : rankNum === 3 ? '🥉 3rd' : '4th';
                    const coinsEarned = getRewardForPlace(rankNum);

                    return (
                      <div
                        key={`rank-${col}`}
                        className={`flex items-center justify-between p-2 rounded-xl border ${
                          isHuman
                            ? 'bg-amber-400/10 border-amber-400/40 text-amber-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-black shrink-0">{rankLabel}</span>
                          <span className="truncate">{getPlayerLabel(col)} {isHuman && '(You)'}</span>
                        </div>
                        <span className="text-amber-400 font-bold text-[11px] shrink-0">
                          +{coinsEarned} Coins
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* POST-GAME REWARD STATUS BOX */}
            {getRewardForPlace(humanPlace) > 0 && (
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-2.5 text-left">
                {/* Header Badge */}
                {!hasClaimedReward && !isRewardUnlocked ? (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-mono font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Reward Locked: +{getRewardForPlace(humanPlace)} Coins</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 border border-amber-400/30 rounded-md text-amber-300 uppercase shrink-0 font-bold">
                      Ad Required
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>+{getRewardForPlace(humanPlace)} Coins Unlocked & Credited!</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!currentUser ? (
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition shadow active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Log in to claim +{getRewardForPlace(humanPlace)} Coins</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    {!hasClaimedReward ? (
                      !isRewardUnlocked ? (
                        <button
                          onClick={handleClaimRewardWithAd}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                        >
                          <Play className="w-4 h-4 fill-slate-950" />
                          <span>Watch Ad & Claim Coins (+{getRewardForPlace(humanPlace)})</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleExecuteClaimReward}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(52,211,153,0.5)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 fill-slate-950" />
                          <span>Claim {getRewardForPlace(humanPlace)} Coins Now!</span>
                        </button>
                      )
                    ) : (
                      <div className="w-full py-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Coins Credited (+{getRewardForPlace(humanPlace)} Coins)</span>
                      </div>
                    )}

                    {claimStatusText && (
                      <p className={`text-[11px] font-mono font-bold text-center ${
                        claimStatusText.includes('⚠️') ? 'text-rose-400' : claimStatusText.includes('🔒') ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {claimStatusText}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-center font-mono pt-1">
              <button
                onClick={() => initGameMatch(humanColor)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  if (onBack) {
                    onBack();
                  } else {
                    setScreen('splash');
                  }
                }}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Exit to Lobby
              </button>
            </div>

          </div>
        )
      )}

      {/* REVIEWS & RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-4 text-white space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-mono font-black uppercase text-xs text-amber-400 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-blue-400" /> Official Rules & Prizes
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Prizes table */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1.5">
              <p className="text-amber-300 font-bold uppercase">🏆 Winning Prizes Structure:</p>
              <div className="space-y-1 text-slate-300 text-[9px]">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-0.5">
                  <span className="font-bold text-amber-400">4 Players (1v3 / Custom):</span>
                  <span>1st: 10 | 2nd: 8 | 3rd: 6 | 4th: 4</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-0.5">
                  <span className="font-bold text-amber-400">3 Players (Custom):</span>
                  <span>1st: 8 | 2nd: 6 | 3rd: 4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">2 Players (1v1 / Custom):</span>
                  <span>1st: 5 | 2nd: 2</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 italic pt-0.5">
                * Coins are awarded ONLY after watching full rewarded ad upon match completion.
              </p>
            </div>

            <ul className="space-y-1.5 text-[11px] font-mono text-slate-300 list-disc list-inside leading-normal">
              <li>5 Lifelines (❤️) per player. 15s timer per turn.</li>
              <li>Failing to roll/move in 15s costs 1 lifeline.</li>
              <li>0 lifelines = Automatic Elimination (0 coins).</li>
              <li>Tokens exit base on rolling a 6.</li>
            </ul>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-xs font-mono rounded-xl transition cursor-pointer"
            >
              Close Review
            </button>
          </div>
        </div>
      )}

      {/* Ad Modal */}
      <AdModal
        isOpen={showAdModal}
        onAdFinished={handleAdFinished}
        onClose={handleAdClosed}
        actionType={adPendingAction}
        rewardText={
          adPendingAction === 'start_ludo'
            ? 'Watch ad to start Ludo match'
            : `Watch ad to unlock +${getRewardForPlace(humanPlace)} Coins reward`
        }
      />

    </div>
  );
};
