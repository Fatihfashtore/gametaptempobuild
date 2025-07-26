import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

import AuthForm from "./auth/AuthForm";
import GameCanvas from "./game/GameCanvas";
import PlayerDashboard from "./dashboard/PlayerDashboard";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
  id: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
  energy: number;
  max_energy: number;
  high_score: number;
  total_games_played: number;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  image_url: string;
}

interface PlayerPet {
  id: string;
  pet_id: string;
  level: number;
  is_active: boolean;
  acquired_at: string;
  pets: Pet;
}

interface GameSession {
  id: string;
  score: number;
  coins_earned: number;
  xp_earned: number;
  obstacles_passed: number;
  duration_seconds?: number;
  pet_used?: string;
  created_at: string;
}

interface Transaction {
  id: string;
  transaction_type:
    | "purchase"
    | "reward"
    | "transfer_sent"
    | "transfer_received"
    | "gacha";
  item_type?: "energy" | "coins" | "pet" | "gacha_pull";
  amount?: number;
  quantity?: number;
  description?: string;
  created_at: string;
}

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [playerPets, setPlayerPets] = useState<PlayerPet[]>([]);
  const [activePet, setActivePet] = useState<PlayerPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("play");
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  // Check for user session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (session?.user) {
          await fetchUserData(session.user.id);
          await fetchPlayerPets(session.user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setUser(session?.user || null);
        if (session?.user) {
          setLoading(true);
          await fetchUserData(session.user.id);
          await fetchPlayerPets(session.user.id);
          setLoading(false);
        } else {
          setUserData(null);
          setPlayerPets([]);
          setActivePet(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user data from Supabase
  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setUserData(data as UserData);
      } else {
        // Create new user profile if it doesn't exist
        const currentUser = await supabase.auth.getUser();
        const newUser = {
          id: userId,
          username:
            currentUser.data.user?.user_metadata?.username ||
            currentUser.data.user?.email?.split("@")[0] ||
            "New Player",
          level: 1,
          xp: 0,
          coins: 100,
          energy: 5,
          max_energy: 5,
          high_score: 0,
          total_games_played: 0,
        };

        const { data: insertedData, error: insertError } = await supabase
          .from("players")
          .insert([newUser])
          .select()
          .single();

        if (insertError) throw insertError;

        setUserData(insertedData as UserData);

        // Give new player a starter pet
        await giveStarterPet(userId);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Set default user data if there's an error
      const currentUser = await supabase.auth.getUser();
      setUserData({
        id: userId,
        username: currentUser.data.user?.email?.split("@")[0] || "New Player",
        level: 1,
        xp: 0,
        coins: 100,
        energy: 5,
        max_energy: 5,
        high_score: 0,
        total_games_played: 0,
      });
    }
  };

  // Fetch player's pets
  const fetchPlayerPets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("player_pets")
        .select(
          `
          *,
          pets (*)
        `,
        )
        .eq("player_id", userId)
        .order("acquired_at", { ascending: false });

      if (error) throw error;

      setPlayerPets(data as PlayerPet[]);

      // Set active pet if none is set
      const activePetData = data.find((pp) => pp.is_active);
      if (activePetData) {
        setActivePet(activePetData as PlayerPet);
      } else if (data.length > 0) {
        // Set first pet as active
        const firstPet = data[0] as PlayerPet;
        await setActivePetInDB(firstPet.id);
        setActivePet(firstPet);
      }
    } catch (error) {
      console.error("Error fetching player pets:", error);
    }
  };

  // Give starter pet to new player
  const giveStarterPet = async (userId: string) => {
    try {
      // Get a random common pet
      const { data: pets, error: petsError } = await supabase
        .from("pets")
        .select("*")
        .eq("rarity", "common")
        .limit(1);

      if (petsError) throw petsError;
      if (!pets || pets.length === 0) return;

      const starterPet = pets[0];

      // Add pet to player's collection
      const { data: playerPet, error: insertError } = await supabase
        .from("player_pets")
        .insert({
          player_id: userId,
          pet_id: starterPet.id,
          level: 1,
          is_active: true,
        })
        .select(
          `
          *,
          pets (*)
        `,
        )
        .single();

      if (insertError) throw insertError;

      // Record transaction
      await supabase.from("transactions").insert({
        player_id: userId,
        transaction_type: "reward",
        item_type: "pet",
        item_id: starterPet.id,
        quantity: 1,
        description: "Starter pet reward",
      });

      setActivePet(playerPet as PlayerPet);
    } catch (error) {
      console.error("Error giving starter pet:", error);
    }
  };

  // Set active pet in database
  const setActivePetInDB = async (playerPetId: string) => {
    if (!user) return;

    try {
      // Deactivate all pets
      await supabase
        .from("player_pets")
        .update({ is_active: false })
        .eq("player_id", user.id);

      // Activate selected pet
      await supabase
        .from("player_pets")
        .update({ is_active: true })
        .eq("id", playerPetId);
    } catch (error) {
      console.error("Error setting active pet:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab("play");
  };

  // Handle energy purchase
  const handlePurchaseEnergy = async (energyAmount: number, cost: number) => {
    if (!userData || !user || userData.coins < cost) return;

    try {
      const newEnergy = Math.min(
        userData.energy + energyAmount,
        userData.max_energy,
      );
      const newCoins = userData.coins - cost;

      // Update player data
      const { error: updateError } = await supabase
        .from("players")
        .update({
          energy: newEnergy,
          coins: newCoins,
        })
        .eq("id", userData.id);

      if (updateError) throw updateError;

      // Record transaction
      await supabase.from("transactions").insert({
        player_id: userData.id,
        transaction_type: "purchase",
        item_type: "energy",
        amount: cost,
        quantity: energyAmount,
        description: `Purchased ${energyAmount} energy`,
      });

      // Update local state
      setUserData({
        ...userData,
        energy: newEnergy,
        coins: newCoins,
      });
    } catch (error) {
      console.error("Error purchasing energy:", error);
    }
  };

  // Handle gacha pull
  const handleGachaPull = async (cost: number) => {
    if (!userData || !user || userData.coins < cost) return;

    try {
      // Determine rarity based on probabilities
      const rand = Math.random();
      let rarity: string;
      if (rand < 0.02) rarity = "legendary";
      else if (rand < 0.1) rarity = "epic";
      else if (rand < 0.3) rarity = "rare";
      else rarity = "common";

      // Get random pet of determined rarity
      const { data: pets, error: petsError } = await supabase
        .from("pets")
        .select("*")
        .eq("rarity", rarity);

      if (petsError) throw petsError;
      if (!pets || pets.length === 0) return;

      const randomPet = pets[Math.floor(Math.random() * pets.length)];

      // Check if player already has this pet
      const { data: existingPet } = await supabase
        .from("player_pets")
        .select("*")
        .eq("player_id", userData.id)
        .eq("pet_id", randomPet.id)
        .single();

      let newPlayerPet: PlayerPet;

      if (existingPet) {
        // Level up existing pet
        const { data: updatedPet, error: updateError } = await supabase
          .from("player_pets")
          .update({ level: existingPet.level + 1 })
          .eq("id", existingPet.id)
          .select(
            `
            *,
            pets (*)
          `,
          )
          .single();

        if (updateError) throw updateError;
        newPlayerPet = updatedPet as PlayerPet;
      } else {
        // Add new pet to collection
        const { data: insertedPet, error: insertError } = await supabase
          .from("player_pets")
          .insert({
            player_id: userData.id,
            pet_id: randomPet.id,
            level: 1,
            is_active: false,
          })
          .select(
            `
            *,
            pets (*)
          `,
          )
          .single();

        if (insertError) throw insertError;
        newPlayerPet = insertedPet as PlayerPet;
      }

      // Update coins
      const newCoins = userData.coins - cost;
      await supabase
        .from("players")
        .update({ coins: newCoins })
        .eq("id", userData.id);

      // Record transactions
      await supabase.from("transactions").insert([
        {
          player_id: userData.id,
          transaction_type: "purchase",
          item_type: "gacha_pull",
          amount: cost,
          description: "Gacha pull",
        },
        {
          player_id: userData.id,
          transaction_type: "gacha",
          item_type: "pet",
          item_id: randomPet.id,
          quantity: 1,
          description: `Gacha result: ${randomPet.name} (${randomPet.rarity})`,
        },
      ]);

      // Update local state
      setUserData({ ...userData, coins: newCoins });
      await fetchPlayerPets(userData.id);

      alert(`You got ${randomPet.name} (${randomPet.rarity})!`);
    } catch (error) {
      console.error("Error with gacha pull:", error);
    }
  };

  // Handle sending coins to friends
  const handleSendCoins = async (friendId: string, amount: number) => {
    if (!userData || !user || userData.coins < amount) return;

    try {
      // Update sender's coins
      const newCoins = userData.coins - amount;
      await supabase
        .from("players")
        .update({ coins: newCoins })
        .eq("id", userData.id);

      // Update receiver's coins
      const { data: friend, error: friendError } = await supabase
        .from("players")
        .select("coins")
        .eq("id", friendId)
        .single();

      if (friendError) throw friendError;

      await supabase
        .from("players")
        .update({ coins: friend.coins + amount })
        .eq("id", friendId);

      // Record transactions
      await supabase.from("transactions").insert([
        {
          player_id: userData.id,
          transaction_type: "transfer_sent",
          item_type: "coins",
          amount: amount,
          to_player_id: friendId,
          description: `Sent ${amount} coins to friend`,
        },
        {
          player_id: friendId,
          transaction_type: "transfer_received",
          item_type: "coins",
          amount: amount,
          from_player_id: userData.id,
          description: `Received ${amount} coins from friend`,
        },
      ]);

      // Update local state
      setUserData({ ...userData, coins: newCoins });
    } catch (error) {
      console.error("Error sending coins:", error);
    }
  };

  // Handle sending pets to friends
  const handleSendPet = async (friendId: string, playerPetId: string) => {
    if (!userData || !user) return;

    try {
      // Get the pet being sent
      const { data: playerPet, error: petError } = await supabase
        .from("player_pets")
        .select(
          `
          *,
          pets (*)
        `,
        )
        .eq("id", playerPetId)
        .single();

      if (petError) throw petError;

      // Remove pet from sender
      await supabase.from("player_pets").delete().eq("id", playerPetId);

      // Add pet to receiver
      await supabase.from("player_pets").insert({
        player_id: friendId,
        pet_id: playerPet.pet_id,
        level: playerPet.level,
        is_active: false,
      });

      // Record transactions
      await supabase.from("transactions").insert([
        {
          player_id: userData.id,
          transaction_type: "transfer_sent",
          item_type: "pet",
          item_id: playerPet.pet_id,
          to_player_id: friendId,
          description: `Sent ${playerPet.pets.name} to friend`,
        },
        {
          player_id: friendId,
          transaction_type: "transfer_received",
          item_type: "pet",
          item_id: playerPet.pet_id,
          from_player_id: userData.id,
          description: `Received ${playerPet.pets.name} from friend`,
        },
      ]);

      // Update local state
      await fetchPlayerPets(userData.id);
    } catch (error) {
      console.error("Error sending pet:", error);
    }
  };

  const startGame = () => {
    if (userData && userData.energy > 0) {
      setIsPlaying(true);
    }
  };

  const endGame = async (
    score: number,
    coinsEarned: number,
    xpEarned: number,
    obstaclesPassed: number,
    duration?: number,
  ) => {
    setIsPlaying(false);

    if (!userData || !user) return;

    try {
      // Calculate new stats
      const newXP = userData.xp + xpEarned;
      const newLevel = Math.floor(newXP / 100) + 1;
      const newEnergy = Math.max(0, userData.energy - 1);
      const newCoins = userData.coins + coinsEarned;
      const newHighScore = Math.max(userData.high_score, score);
      const newTotalGames = userData.total_games_played + 1;

      // Update player stats
      const { error: updateError } = await supabase
        .from("players")
        .update({
          xp: newXP,
          level: newLevel,
          energy: newEnergy,
          coins: newCoins,
          high_score: newHighScore,
          total_games_played: newTotalGames,
        })
        .eq("id", userData.id);

      if (updateError) throw updateError;

      // Record game session
      const { error: sessionError } = await supabase
        .from("game_sessions")
        .insert({
          player_id: userData.id,
          score,
          coins_earned: coinsEarned,
          xp_earned: xpEarned,
          obstacles_passed: obstaclesPassed,
          duration_seconds: duration,
          pet_used: activePet?.pet_id,
        });

      if (sessionError) throw sessionError;

      // Record coin transaction if any coins were earned
      if (coinsEarned > 0) {
        await supabase.from("transactions").insert({
          player_id: userData.id,
          transaction_type: "reward",
          item_type: "coins",
          amount: coinsEarned,
          description: `Game reward - Score: ${score}`,
        });
      }

      // Update local state
      setUserData({
        ...userData,
        xp: newXP,
        level: newLevel,
        energy: newEnergy,
        coins: newCoins,
        high_score: newHighScore,
        total_games_played: newTotalGames,
      });
    } catch (error) {
      console.error("Error ending game:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=64&q=80"
              alt="Game Logo"
              className="h-10 w-10 rounded-full"
            />
            <h1 className="text-xl font-bold text-primary">
              Tap Pet Adventure
            </h1>
          </div>

          {user && userData ? (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">🪙</span>
                  <span className="font-medium">
                    {userData.coins.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-500">⚡</span>
                  <span className="font-medium">
                    {userData.energy}/{userData.max_energy}
                  </span>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  Level {userData.level}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={
                      userData.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`
                    }
                  />
                  <AvatarFallback>
                    {userData.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline font-medium">
                  {userData.username}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div>{/* Empty div to maintain layout when not logged in */}</div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {!user ? (
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center min-h-[70vh]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    Welcome to Tap Pet Adventure!
                  </CardTitle>
                  <CardDescription className="text-center">
                    Login or register to start your adventure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AuthForm />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block w-full max-w-md"
            >
              <img
                src="https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80"
                alt="Game Preview"
                className="rounded-lg shadow-xl"
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold">Collect Adorable Pets!</h3>
                <p className="text-muted-foreground">
                  Tap to fly, collect coins, and unlock new pets
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div>
            {userData && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Level {userData.level}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {userData.xp} XP
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {userData.xp % 100}/100 to next level
                  </span>
                </div>
                <Progress value={userData.xp % 100} className="h-2" />
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="play">Play Game</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="shop">Shop</TabsTrigger>
              </TabsList>

              <TabsContent value="play" className="mt-4">
                {isPlaying ? (
                  <GameCanvas
                    onGameOver={(score, coins, xp) => {
                      // Calculate obstacles passed from score
                      const obstaclesPassed = score;
                      endGame(score, coins, xp, obstaclesPassed);
                    }}
                    playerLevel={userData?.level || 1}
                    petType={activePet?.pets?.type || "bird"}
                    energy={userData?.energy || 0}
                    maxEnergy={userData?.max_energy || 5}
                  />
                ) : (
                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle>Tap Pet Adventure</CardTitle>
                      <CardDescription>
                        Tap to make your pet fly through obstacles and collect
                        coins!
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80"
                        alt="Game Preview"
                        className="rounded-lg h-64 object-cover"
                      />
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      {userData && userData.energy > 0 ? (
                        <Button onClick={startGame} size="lg" className="px-8">
                          Start Game (⚡ {userData.energy} remaining)
                        </Button>
                      ) : (
                        <div className="text-center">
                          <Button disabled size="lg" className="px-8 mb-2">
                            Out of Energy
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            Visit the shop to purchase more energy
                          </p>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="dashboard">
                <PlayerDashboard
                  playerData={
                    userData
                      ? {
                          username: userData.username,
                          level: userData.level,
                          xp: userData.xp,
                          xpToNextLevel:
                            (Math.floor(userData.xp / 100) + 1) * 100,
                          coins: userData.coins,
                          energy: userData.energy,
                          maxEnergy: userData.max_energy,
                          highScore: userData.high_score,
                          totalGamesPlayed: userData.total_games_played,
                          avatarUrl:
                            userData.avatar_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
                        }
                      : undefined
                  }
                  petCollection={playerPets.map((pp) => ({
                    id: pp.id,
                    name: pp.pets.name,
                    rarity: pp.pets.rarity,
                    level: pp.level,
                    imageUrl: pp.pets.image_url,
                  }))}
                  onPurchaseEnergy={handlePurchaseEnergy}
                  onGachaPull={handleGachaPull}
                  onSendCoins={handleSendCoins}
                  onSendPet={handleSendPet}
                />
              </TabsContent>

              <TabsContent value="shop">
                <Card>
                  <CardHeader>
                    <CardTitle>Pet Shop</CardTitle>
                    <CardDescription>
                      Purchase energy refills, gacha pulls, and special items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Energy Refill
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Restore 5 energy points</p>
                          <p className="text-yellow-500 font-bold mt-2">
                            🪙 50 coins
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() => handlePurchaseEnergy(5, 50)}
                            disabled={!userData || userData.coins < 50}
                          >
                            Purchase
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Pet Gacha</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Get a random pet (common to legendary)</p>
                          <p className="text-yellow-500 font-bold mt-2">
                            🪙 100 coins
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() => handleGachaPull(100)}
                            disabled={!userData || userData.coins < 100}
                          >
                            Try Your Luck
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Full Energy</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Restore to maximum energy</p>
                          <p className="text-yellow-500 font-bold mt-2">
                            🪙 80 coins
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() =>
                              handlePurchaseEnergy(
                                userData?.max_energy || 5,
                                80,
                              )
                            }
                            disabled={
                              !userData ||
                              userData.coins < 80 ||
                              userData.energy >= userData.max_energy
                            }
                          >
                            Purchase
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-800 p-4 shadow-inner mt-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2023 Tap Pet Adventure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
