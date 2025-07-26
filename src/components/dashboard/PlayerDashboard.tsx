import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Gift,
  Trophy,
  Users,
  Star,
  ShoppingBag,
  Heart,
  Send,
  Plus,
  Zap,
  CoinsIcon,
} from "lucide-react";

interface PlayerDashboardProps {
  playerData?: {
    username: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    coins: number;
    energy: number;
    maxEnergy: number;
    highScore: number;
    totalGamesPlayed: number;
    avatarUrl: string;
  };
  petCollection?: Array<{
    id: string;
    name: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    level: number;
    imageUrl: string;
  }>;
  friends?: Array<{
    id: string;
    username: string;
    avatarUrl: string;
    isOnline: boolean;
  }>;
  leaderboard?: Array<{
    rank: number;
    username: string;
    score: number;
    avatarUrl: string;
  }>;
}

const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  playerData = {
    username: "Player1",
    level: 5,
    xp: 350,
    xpToNextLevel: 500,
    coins: 1250,
    energy: 7,
    maxEnergy: 10,
    highScore: 1876,
    totalGamesPlayed: 42,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=player1",
  },
  petCollection = [
    {
      id: "1",
      name: "Fluffy",
      rarity: "common",
      level: 3,
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=pet1",
    },
    {
      id: "2",
      name: "Sparky",
      rarity: "rare",
      level: 5,
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=pet2",
    },
    {
      id: "3",
      name: "Shadow",
      rarity: "epic",
      level: 2,
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=pet3",
    },
    {
      id: "4",
      name: "Luna",
      rarity: "legendary",
      level: 7,
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=pet4",
    },
  ],
  friends = [
    {
      id: "1",
      username: "Friend1",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=friend1",
      isOnline: true,
    },
    {
      id: "2",
      username: "Friend2",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=friend2",
      isOnline: false,
    },
    {
      id: "3",
      username: "Friend3",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=friend3",
      isOnline: true,
    },
  ],
  leaderboard = [
    {
      rank: 1,
      username: "ProGamer",
      score: 5432,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=leader1",
    },
    {
      rank: 2,
      username: "GameMaster",
      score: 4987,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=leader2",
    },
    {
      rank: 3,
      username: "TopPlayer",
      score: 4521,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=leader3",
    },
    {
      rank: 4,
      username: "Player1",
      score: 1876,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=player1",
    },
    {
      rank: 5,
      username: "Challenger",
      score: 1654,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=leader5",
    },
  ],
}) => {
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [isGachaDialogOpen, setIsGachaDialogOpen] = useState<boolean>(false);

  const rarityColors = {
    common: "bg-slate-200 text-slate-800",
    rare: "bg-blue-200 text-blue-800",
    epic: "bg-purple-200 text-purple-800",
    legendary: "bg-amber-200 text-amber-800",
  };

  const shopItems = [
    {
      id: "1",
      name: "Small Energy Refill",
      description: "+3 Energy",
      price: 50,
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
    },
    {
      id: "2",
      name: "Medium Energy Refill",
      description: "+5 Energy",
      price: 80,
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
    },
    {
      id: "3",
      name: "Full Energy Refill",
      description: "Full Energy",
      price: 120,
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
    },
    {
      id: "4",
      name: "Coin Booster",
      description: "+20% Coins for 1 hour",
      price: 200,
      icon: <CoinsIcon className="h-8 w-8 text-yellow-500" />,
    },
  ];

  return (
    <div className="bg-background p-4 md:p-6 min-h-screen">
      {/* Player Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={playerData.avatarUrl} alt={playerData.username} />
            <AvatarFallback>
              {playerData.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{playerData.username}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" /> Level {playerData.level}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" /> High Score:{" "}
                {playerData.highScore}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            <CoinsIcon className="h-5 w-5" />
            <span className="font-semibold">{playerData.coins}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-semibold">
                {playerData.energy}/{playerData.maxEnergy}
              </span>
            </div>
            <Progress
              value={(playerData.energy / playerData.maxEnergy) * 100}
              className="w-24 h-2"
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => {}}>
            Play Game
          </Button>
        </div>
      </div>

      {/* XP Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>XP Progress</span>
              <span>
                {playerData.xp}/{playerData.xpToNextLevel}
              </span>
            </div>
            <Progress
              value={(playerData.xp / playerData.xpToNextLevel) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground text-center mt-1">
              {playerData.xpToNextLevel - playerData.xp} XP needed for Level{" "}
              {playerData.level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Stats
          </TabsTrigger>
          <TabsTrigger value="pets" className="flex items-center gap-2">
            <Heart className="h-4 w-4" /> Pets
          </TabsTrigger>
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Shop
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Social
          </TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Player Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">{playerData.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">High Score:</span>
                    <span className="font-medium">{playerData.highScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Games Played:</span>
                    <span className="font-medium">
                      {playerData.totalGamesPlayed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Coins:</span>
                    <span className="font-medium">{playerData.coins}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Today</p>
                    <p>Earned 120 coins</p>
                    <p>Reached level {playerData.level}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Yesterday</p>
                    <p>Collected new pet: Sparky</p>
                    <p>Achieved high score: {playerData.highScore}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-800"
                    >
                      <Star className="h-3 w-3 mr-1" /> Gold
                    </Badge>
                    <span>First Flight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-slate-100 text-slate-800"
                    >
                      <Star className="h-3 w-3 mr-1" /> Silver
                    </Badge>
                    <span>Coin Collector</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-amber-800 text-amber-100"
                    >
                      <Star className="h-3 w-3 mr-1" /> Bronze
                    </Badge>
                    <span>Pet Master</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pets Tab */}
        <TabsContent value="pets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              My Pet Collection ({petCollection.length})
            </h3>
            <div className="flex gap-2">
              <Dialog
                open={isGachaDialogOpen}
                onOpenChange={setIsGachaDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Gift className="h-4 w-4" /> Gacha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pet Gacha</DialogTitle>
                    <DialogDescription>
                      Try your luck and summon a new pet! It costs 100 coins per
                      summon.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <Gift className="h-16 w-16 text-primary animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Summon Chances:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <div>Common: 70%</div>
                        <div>Rare: 20%</div>
                        <div>Epic: 8%</div>
                        <div>Legendary: 2%</div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsGachaDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button className="flex items-center gap-2">
                      <CoinsIcon className="h-4 w-4" /> Summon (100 coins)
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {petCollection.map((pet) => (
              <Card
                key={pet.id}
                className={`overflow-hidden border-t-4 ${rarityColors[pet.rarity]}`}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold">{pet.name}</h4>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3" /> Level {pet.level}
                  </div>
                  <Badge
                    variant="outline"
                    className={`mt-2 text-xs ${rarityColors[pet.rarity]}`}
                  >
                    {pet.rarity.charAt(0).toUpperCase() + pet.rarity.slice(1)}
                  </Badge>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-2 py-0 h-7"
                    >
                      Use
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-0 h-7"
                        >
                          Send
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Send Pet to Friend
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Select a friend to send {pet.name} to. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Select
                            onValueChange={(value) => setSelectedFriend(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a friend" />
                            </SelectTrigger>
                            <SelectContent>
                              {friends.map((friend) => (
                                <SelectItem key={friend.id} value={friend.id}>
                                  {friend.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction disabled={!selectedFriend}>
                            Send Pet
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="shop" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Shop</h3>
            <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              <CoinsIcon className="h-5 w-5" />
              <span className="font-semibold">{playerData.coins}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {shopItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mb-4">{item.icon}</div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <Button className="mt-4 w-full flex items-center justify-center gap-2">
                    <CoinsIcon className="h-4 w-4" /> {item.price}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Special Offers</CardTitle>
              <CardDescription>Limited time deals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Card className="flex-1 border-2 border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Weekly Pass</CardTitle>
                    <CardDescription>7 days of bonuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-500" /> Daily energy
                        refill
                      </li>
                      <li className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-500" /> +20% coin
                        bonus
                      </li>
                      <li className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-500" /> 1 free gacha
                        pull daily
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">500 coins</Button>
                  </CardFooter>
                </Card>

                <Card className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Starter Pack</CardTitle>
                    <CardDescription>Perfect for new players</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-500" /> 5 energy
                        refills
                      </li>
                      <li className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-500" /> 3 gacha
                        pulls
                      </li>
                      <li className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-500" /> 200 bonus
                        coins
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">300 coins</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-4">
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Friends ({friends.length})
                  </CardTitle>
                  <CardDescription>
                    Send coins or pets to your friends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage
                                  src={friend.avatarUrl}
                                  alt={friend.username}
                                />
                                <AvatarFallback>
                                  {friend.username
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${friend.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                              ></div>
                            </div>
                            <div>
                              <p className="font-medium">{friend.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {friend.isOnline ? "Online" : "Offline"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <CoinsIcon className="h-3 w-3" /> Send
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Send Coins</DialogTitle>
                                  <DialogDescription>
                                    Send coins to{" "}
                                    {
                                      friends.find((f) => f.id === friend.id)
                                        ?.username
                                    }
                                    .
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Amount"
                                      min={1}
                                      max={playerData.coins}
                                      value={coinAmount || ""}
                                      onChange={(e) =>
                                        setCoinAmount(
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                    />
                                    <span className="flex items-center gap-1">
                                      <CoinsIcon className="h-4 w-4 text-amber-500" />
                                      Coins
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    You have {playerData.coins} coins available.
                                  </p>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button
                                    disabled={
                                      coinAmount <= 0 ||
                                      coinAmount > playerData.coins
                                    }
                                  >
                                    Send Coins
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Send className="h-3 w-3" /> Message
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Friend
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Global Leaderboard</CardTitle>
                  <CardDescription>Top players by high score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaderboard.map((entry) => (
                      <div key={entry.rank} className="flex items-center">
                        <div className="w-8 text-center font-bold">
                          {entry.rank}
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarImage
                              src={entry.avatarUrl}
                              alt={entry.username}
                            />
                            <AvatarFallback>
                              {entry.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{entry.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.username === playerData.username
                                ? "(You)"
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span className="font-semibold">{entry.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline">View Full Leaderboard</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerDashboard;
