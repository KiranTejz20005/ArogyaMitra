"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
    LayoutDashboard,
    Dumbbell,
    Utensils,
    BarChart2,
    Calendar,
    Settings,
    User,
    Search,
    PlusCircle,
    Trophy,
    Flame,
    Droplets,
    Moon,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workout Plans", href: "/dashboard/workouts", icon: Dumbbell },
    { name: "Nutrition", href: "/dashboard/nutrition", icon: Utensils },
    { name: "Progress", href: "/dashboard/progress", icon: BarChart2 },
    { name: "Videos", href: "/videos", icon: Search },
]

export function Sidebar() {
    const pathname = usePathname()
    const [goals, setGoals] = useState({
        water: { current: 1.5, target: 3 },
        calories: { current: 1800, target: 2400 },
        sleep: { current: 6, target: 8 },
    })

    useEffect(() => {
        // In a real app, Fetch from API
    }, [])

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
                    <span className="font-display text-lg font-bold">ArogyaMitra</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 transition-colors ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                                        }`}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-8">
                    <h3 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Daily Goals
                    </h3>
                    <div className="space-y-4 px-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Droplets className="h-3.5 w-3.5 text-blue-500" /> Water
                                </span>
                                <span className="font-medium">{goals.water.current}/{goals.water.target}L</span>
                            </div>
                            <Progress value={(goals.water.current / goals.water.target) * 100} className="h-1" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Flame className="h-3.5 w-3.5 text-orange-500" /> Calories
                                </span>
                                <span className="font-medium">{goals.calories.current}/{goals.calories.target}</span>
                            </div>
                            <Progress value={(goals.calories.current / goals.calories.target) * 100} className="h-1" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Moon className="h-3.5 w-3.5 text-purple-500" /> Sleep
                                </span>
                                <span className="font-medium">{goals.sleep.current}/{goals.sleep.target}h</span>
                            </div>
                            <Progress value={(goals.sleep.current / goals.sleep.target) * 100} className="h-1" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t p-4">
                <Card className="border-none bg-primary/10">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                                <Trophy className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-primary">Level 4 Miner</p>
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <span>2,400 XP</span>
                                    <span>•</span>
                                    <span>Goal: 3,000</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
