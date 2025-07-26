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
  avatar_url?: string;
}

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("play");
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  // Check for user session on mount
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      if (session?.user) {
        fetchUserData(session.user.id);
      }
    };

    getSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUserData(null);
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

      if (error) throw error;

      if (data) {
        setUserData(data as UserData);
      } else {
        // Create new user profile if it doesn't exist
        const newUser = {
          id: userId,
          username: "New Player",
          level: 1,
          xp: 0,
          coins: 10,
          energy: 5,
          max_energy: 5,
        };

        const { error: insertError } = await supabase
          .from("players")
          .insert([newUser]);

        if (insertError) throw insertError;

        setUserData(newUser);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab("play");
  };

  const startGame = () => {
    if (userData && userData.energy > 0) {
      setIsPlaying(true);
    }
  };

  const endGame = async (score: number, coinsEarned: number) => {
    setIsPlaying(false);

    if (userData) {
      // Calculate XP (1 XP per point)
      const newXP = userData.xp + score;
      // Calculate level (simple formula: level up every 100 XP)
      const newLevel = Math.floor(newXP / 100) + 1;
      // Update energy
      const newEnergy = userData.energy - 1;
      // Update coins
      const newCoins = userData.coins + coinsEarned;

      const updatedUserData = {
        ...userData,
        xp: newXP,
        level: newLevel,
        energy: newEnergy,
        coins: newCoins,
      };

      // Update in Supabase
      await supabase
        .from("players")
        .update(updatedUserData)
        .eq("id", userData.id);

      setUserData(updatedUserData);
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
                    onGameEnd={endGame}
                    playerLevel={userData?.level || 1}
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
                <PlayerDashboard userData={userData} />
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
                            🪙 10.00 coins
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full">Purchase</Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Pet Gacha</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Get a random pet (common to legendary)</p>
                          <p className="text-yellow-500 font-bold mt-2">
                            🪙 25.00 coins
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full">Try Your Luck</Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Coin Pack</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Get 50 extra coins</p>
                          <p className="text-green-500 font-bold mt-2">
                            Premium Purchase
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full" variant="outline">
                            Buy Now
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
