"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Plus, Loader2, TrendingUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProgressRecord {
  id: string
  weight_kg: number | null
  body_fat_percentage: number | null
  calories_consumed: number | null
  calories_burned: number | null
  steps: number | null
  water_liters: number | null
  sleep_hours: number | null
  mood: string | null
  notes: string | null
  recorded_date: string
}

interface ProgressViewProps {
  userId: string
  records: ProgressRecord[]
}

export function ProgressView({ userId, records }: ProgressViewProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [weight, setWeight] = useState("")
  const [bodyFat, setBodyFat] = useState("")
  const [caloriesConsumed, setCaloriesConsumed] = useState("")
  const [caloriesBurned, setCaloriesBurned] = useState("")
  const [steps, setSteps] = useState("")
  const [water, setWater] = useState("")
  const [sleep, setSleep] = useState("")
  const [mood, setMood] = useState("")
  const [notes, setNotes] = useState("")

  const handleLog = async () => {
    setLoading(true)
    const supabase = createClient()

    await supabase.from("progress_records").insert({
      user_id: userId,
      weight_kg: weight ? parseFloat(weight) : null,
      body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
      calories_consumed: caloriesConsumed ? parseInt(caloriesConsumed) : null,
      calories_burned: caloriesBurned ? parseInt(caloriesBurned) : null,
      steps: steps ? parseInt(steps) : null,
      water_liters: water ? parseFloat(water) : null,
      sleep_hours: sleep ? parseFloat(sleep) : null,
      mood: mood || null,
      notes: notes || null,
    })

    setWeight("")
    setBodyFat("")
    setCaloriesConsumed("")
    setCaloriesBurned("")
    setSteps("")
    setWater("")
    setSleep("")
    setMood("")
    setNotes("")
    setDialogOpen(false)
    setLoading(false)
    router.refresh()
  }

  const chartData = records.map((r) => ({
    date: new Date(r.recorded_date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    weight: r.weight_kg ? Number(r.weight_kg) : null,
    calories: r.calories_burned,
    steps: r.steps,
    sleep: r.sleep_hours ? Number(r.sleep_hours) : null,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Progress Tracking
          </h2>
          <p className="text-sm text-muted-foreground">
            Log daily metrics and visualize your journey
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Log Progress
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Log Today&apos;s Progress</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="70.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Body Fat %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="15"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Calories Consumed</Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={caloriesConsumed}
                    onChange={(e) => setCaloriesConsumed(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Calories Burned</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Steps</Label>
                  <Input
                    type="number"
                    placeholder="8000"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Water (L)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="2.5"
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Sleep (hrs)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="7.5"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="great">Great</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="okay">Okay</SelectItem>
                    <SelectItem value="tired">Tired</SelectItem>
                    <SelectItem value="stressed">Stressed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Any notes about today..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleLog} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Progress
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <p className="font-medium text-foreground">No progress logged yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start logging daily to see your trends
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Weight Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Weight Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Steps Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Steps Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="steps"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Calories Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Calories Burned Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))", r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sleep Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sleep Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sleep"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-4))", r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent entries table */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Date</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Weight</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Steps</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Calories</th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">Sleep</th>
                    <th className="pb-2 font-medium text-muted-foreground">Mood</th>
                  </tr>
                </thead>
                <tbody>
                  {[...records].reverse().slice(0, 10).map((r) => (
                    <tr key={r.id} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 text-foreground">
                        {new Date(r.recorded_date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-2.5 pr-4 text-foreground">
                        {r.weight_kg ? `${Number(r.weight_kg).toFixed(1)} kg` : "--"}
                      </td>
                      <td className="py-2.5 pr-4 text-foreground">
                        {r.steps?.toLocaleString() || "--"}
                      </td>
                      <td className="py-2.5 pr-4 text-foreground">
                        {r.calories_burned || "--"}
                      </td>
                      <td className="py-2.5 pr-4 text-foreground">
                        {r.sleep_hours ? `${Number(r.sleep_hours).toFixed(1)}h` : "--"}
                      </td>
                      <td className="py-2.5 capitalize text-foreground">
                        {r.mood || "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
