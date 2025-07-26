import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Heart, Pause, Play, RefreshCw } from "lucide-react";

interface GameCanvasProps {
  onGameOver?: (score: number, coins: number, xp: number) => void;
  playerLevel?: number;
  petType?: string;
  energy?: number;
  maxEnergy?: number;
}

const GameCanvas = ({
  onGameOver = () => {},
  playerLevel = 1,
  petType = "bird",
  energy = 5,
  maxEnergy = 5,
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [petPosition, setPetPosition] = useState(250);
  const [petVelocity, setPetVelocity] = useState(0);
  const [obstacles, setObstacles] = useState<
    Array<{ id: number; x: number; gapPosition: number }>
  >([]);
  const [nextObstacleId, setNextObstacleId] = useState(0);
  const [energyUsed, setEnergyUsed] = useState(0);

  // Game constants
  const GRAVITY = 0.5;
  const JUMP_FORCE = -8;
  const OBSTACLE_SPEED = 3;
  const OBSTACLE_FREQUENCY = 1500; // ms
  const OBSTACLE_WIDTH = 60;
  const GAP_HEIGHT = 150;
  const CANVAS_HEIGHT = 600;
  const CANVAS_WIDTH = 800;
  const PET_SIZE = 40;
  const COIN_REWARD_BASE = 0.05; // Base coin reward per obstacle

  // Game loop
  useEffect(() => {
    if (!gameStarted || gamePaused || gameOver) return;

    const gameLoop = setInterval(() => {
      // Apply gravity to pet
      setPetVelocity((prev) => prev + GRAVITY);
      setPetPosition((prev) => {
        const newPosition = prev + petVelocity;

        // Check boundaries
        if (newPosition <= 0) {
          return 0;
        } else if (newPosition >= CANVAS_HEIGHT - PET_SIZE) {
          handleGameOver();
          return CANVAS_HEIGHT - PET_SIZE;
        }

        return newPosition;
      });

      // Move obstacles
      setObstacles((prev) => {
        const updatedObstacles = prev.map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - OBSTACLE_SPEED,
        }));

        // Remove obstacles that are off-screen
        const filteredObstacles = updatedObstacles.filter(
          (obstacle) => obstacle.x > -OBSTACLE_WIDTH,
        );

        // Check for passed obstacles and update score
        const passedObstacles = updatedObstacles.filter(
          (obstacle) =>
            obstacle.x + OBSTACLE_WIDTH < 100 &&
            obstacle.x + OBSTACLE_WIDTH >= 100 - OBSTACLE_SPEED,
        );

        if (passedObstacles.length > 0) {
          setScore((prev) => prev + passedObstacles.length);
          const earnedCoins =
            passedObstacles.length * COIN_REWARD_BASE * playerLevel;
          setCoins((prev) => prev + earnedCoins);
          setXp((prev) => prev + passedObstacles.length * 10);
        }

        // Check for collisions
        const collisions = filteredObstacles.some((obstacle) => {
          const petLeft = 100;
          const petRight = 100 + PET_SIZE;
          const petTop = petPosition;
          const petBottom = petPosition + PET_SIZE;

          const obstacleLeft = obstacle.x;
          const obstacleRight = obstacle.x + OBSTACLE_WIDTH;

          const gapTop = obstacle.gapPosition;
          const gapBottom = obstacle.gapPosition + GAP_HEIGHT;

          // Check if pet is within obstacle x-range
          if (petRight > obstacleLeft && petLeft < obstacleRight) {
            // Check if pet is outside the gap
            if (petTop < gapTop || petBottom > gapBottom) {
              return true; // Collision detected
            }
          }

          return false;
        });

        if (collisions) {
          handleGameOver();
        }

        return filteredObstacles;
      });
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [
    gameStarted,
    gamePaused,
    gameOver,
    petPosition,
    petVelocity,
    obstacles,
    playerLevel,
  ]);

  // Spawn obstacles
  useEffect(() => {
    if (!gameStarted || gamePaused || gameOver) return;

    const spawnObstacle = setInterval(() => {
      const gapPosition =
        Math.floor(Math.random() * (CANVAS_HEIGHT - GAP_HEIGHT - 100)) + 50;

      setObstacles((prev) => [
        ...prev,
        {
          id: nextObstacleId,
          x: CANVAS_WIDTH,
          gapPosition,
        },
      ]);

      setNextObstacleId((prev) => prev + 1);
    }, OBSTACLE_FREQUENCY);

    return () => clearInterval(spawnObstacle);
  }, [gameStarted, gamePaused, gameOver, nextObstacleId]);

  // Handle tap/click
  const handleTap = () => {
    if (!gameStarted) {
      startGame();
      return;
    }

    if (gamePaused || gameOver) return;

    // Make pet jump
    setPetVelocity(JUMP_FORCE);
  };

  const startGame = () => {
    if (energy <= energyUsed) {
      // Not enough energy
      return;
    }

    setGameStarted(true);
    setGameOver(false);
    setGamePaused(false);
    setScore(0);
    setCoins(0);
    setXp(0);
    setPetPosition(250);
    setPetVelocity(0);
    setObstacles([]);
    setEnergyUsed((prev) => prev + 1);
  };

  const pauseGame = () => {
    setGamePaused(!gamePaused);
  };

  const restartGame = () => {
    if (energy <= energyUsed) {
      // Not enough energy
      return;
    }

    setGameStarted(true);
    setGameOver(false);
    setGamePaused(false);
    setScore(0);
    setCoins(0);
    setXp(0);
    setPetPosition(250);
    setPetVelocity(0);
    setObstacles([]);
    setEnergyUsed((prev) => prev + 1);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
    onGameOver(score, coins, xp);
  };

  // Pet images based on type
  const getPetImage = () => {
    switch (petType) {
      case "bird":
        return "https://api.dicebear.com/7.x/avataaars/svg?seed=bird";
      case "cat":
        return "https://api.dicebear.com/7.x/avataaars/svg?seed=cat";
      case "dog":
        return "https://api.dicebear.com/7.x/avataaars/svg?seed=dog";
      default:
        return "https://api.dicebear.com/7.x/avataaars/svg?seed=pet";
    }
  };

  return (
    <Card className="relative w-full max-w-[800px] h-[600px] bg-gradient-to-b from-blue-300 to-blue-500 overflow-hidden">
      {/* Game canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-pointer"
        onClick={handleTap}
      >
        {/* Sky background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-500">
          {/* Clouds */}
          <div className="absolute top-20 left-40 w-20 h-10 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-50 left-100 w-32 h-16 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-30 left-200 w-24 h-12 bg-white rounded-full opacity-80"></div>
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-green-800 to-green-600"></div>

        {/* Obstacles */}
        {obstacles.map((obstacle) => (
          <React.Fragment key={obstacle.id}>
            {/* Top obstacle */}
            <div
              className="absolute bg-green-700 border-r-4 border-l-4 border-green-900"
              style={{
                left: `${obstacle.x}px`,
                top: 0,
                width: `${OBSTACLE_WIDTH}px`,
                height: `${obstacle.gapPosition}px`,
              }}
            >
              <div className="absolute bottom-0 w-full h-6 bg-green-900 rounded-b-md"></div>
            </div>

            {/* Bottom obstacle */}
            <div
              className="absolute bg-green-700 border-r-4 border-l-4 border-green-900"
              style={{
                left: `${obstacle.x}px`,
                top: `${obstacle.gapPosition + GAP_HEIGHT}px`,
                width: `${OBSTACLE_WIDTH}px`,
                height: `${CANVAS_HEIGHT - (obstacle.gapPosition + GAP_HEIGHT)}px`,
              }}
            >
              <div className="absolute top-0 w-full h-6 bg-green-900 rounded-t-md"></div>
            </div>
          </React.Fragment>
        ))}

        {/* Pet character */}
        <motion.div
          className="absolute left-[100px] z-10"
          style={{
            top: `${petPosition}px`,
            width: `${PET_SIZE}px`,
            height: `${PET_SIZE}px`,
            rotate: petVelocity * 2, // Rotate based on velocity for flying effect
          }}
          animate={{ rotate: petVelocity * 2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <img
            src={getPetImage()}
            alt="Pet"
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Game UI */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-white/80 text-black font-bold px-3 py-1 flex items-center gap-1"
            >
              <Coins size={16} className="text-yellow-500" />
              {coins.toFixed(2)}
            </Badge>

            <Badge
              variant="outline"
              className="bg-white/80 text-black font-bold px-3 py-1"
            >
              Score: {score}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-white/80 text-black font-bold px-3 py-1 flex items-center gap-1"
            >
              <Heart size={16} className="text-red-500" />
              {energy - energyUsed}/{maxEnergy}
            </Badge>

            {gameStarted && !gameOver && (
              <Button
                size="sm"
                variant="outline"
                className="bg-white/80"
                onClick={(e) => {
                  e.stopPropagation();
                  pauseGame();
                }}
              >
                {gamePaused ? <Play size={16} /> : <Pause size={16} />}
              </Button>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div className="absolute bottom-24 left-4 right-4">
          <div className="text-xs text-white font-bold mb-1 flex justify-between">
            <span>XP: {xp}</span>
            <span>Level: {playerLevel}</span>
          </div>
          <Progress value={xp % 100} className="h-2" />
        </div>

        {/* Start screen */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
              <h2 className="text-2xl font-bold mb-4">Tap to Fly</h2>
              <p className="mb-4">
                Tap the screen to make your pet fly through obstacles!
              </p>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="w-full"
                disabled={energy <= energyUsed}
              >
                {energy <= energyUsed ? "No Energy Left" : "Start Game"}
              </Button>
            </div>
          </div>
        )}

        {/* Pause screen */}
        {gamePaused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
              <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    pauseGame();
                  }}
                  className="flex-1"
                >
                  Resume
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGameOver();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Quit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Game over screen */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
              <h2 className="text-2xl font-bold mb-4">Game Over</h2>
              <div className="mb-4 space-y-2">
                <p>
                  Score: <span className="font-bold">{score}</span>
                </p>
                <p>
                  Coins: <span className="font-bold">{coins.toFixed(2)}</span>
                </p>
                <p>
                  XP Gained: <span className="font-bold">{xp}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    restartGame();
                  }}
                  className="flex-1 gap-1"
                  disabled={energy <= energyUsed}
                >
                  <RefreshCw size={16} />
                  Play Again
                </Button>
              </div>
              {energy <= energyUsed && (
                <p className="mt-2 text-sm text-red-500">
                  No energy left! Visit the shop to refill.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GameCanvas;
