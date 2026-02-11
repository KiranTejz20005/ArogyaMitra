"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getStoredAvatarUrl, setStoredAvatarUrl } from "@/lib/avatar-store"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, UserCircle, Activity, Target, Scale, Camera } from "lucide-react"

interface Profile {
  id: string
  full_name: string | null
  age: number | null
  gender: string | null
  height_cm: number | null
  weight_kg: number | null
  fitness_goal: string | null
  activity_level: string | null
  dietary_preference: string | null
}

interface Assessment {
  bmi: number | null
  bmi_category: string | null
  health_conditions: string[] | null
  sleep_hours: number | null
  stress_level: string | null
}

interface ProfileViewProps {
  user: User
  profile: Profile | null
  assessment: Assessment | null
}

export function ProfileView({ user, profile, assessment }: ProfileViewProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [age, setAge] = useState(profile?.age?.toString() || "")
  const [gender, setGender] = useState(profile?.gender || "")
  const [heightCm, setHeightCm] = useState(profile?.height_cm?.toString() || "")
  const [weightKg, setWeightKg] = useState(profile?.weight_kg?.toString() || "")
  const [fitnessGoal, setFitnessGoal] = useState(profile?.fitness_goal || "")
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || "")
  const [dietaryPref, setDietaryPref] = useState(profile?.dietary_preference || "")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  useEffect(() => {
    setAvatarUrl(getStoredAvatarUrl())
  }, [])

  const initials = (fullName || user.email?.split("@")[0] || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        fitness_goal: fitnessGoal || null,
        activity_level: activityLevel || null,
        dietary_preference: dietaryPref || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    setSaving(false)
    router.refresh()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setStoredAvatarUrl(dataUrl)
      setAvatarUrl(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleRemoveAvatar = () => {
    setStoredAvatarUrl(null)
    setAvatarUrl(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal info and fitness preferences
        </p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="flex items-center gap-5 p-6">
          <div className="relative">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="bg-primary/10 text-lg text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow transition hover:bg-primary/90">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
                aria-label="Change profile photo"
              />
            </label>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {fullName || "Set your name"}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="mt-1 text-xs text-primary hover:underline"
              >
                Remove profile photo
              </button>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {fitnessGoal && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Target className="mr-1 h-3 w-3" />
                  {fitnessGoal}
                </Badge>
              )}
              {activityLevel && (
                <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                  <Activity className="mr-1 h-3 w-3" />
                  {activityLevel}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="170"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fitness Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-5 w-5 text-primary" />
              Fitness Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Fitness Goal</Label>
              <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                  <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                  <SelectItem value="Maintain Fitness">Maintain Fitness</SelectItem>
                  <SelectItem value="Improve Endurance">Improve Endurance</SelectItem>
                  <SelectItem value="Flexibility">Flexibility</SelectItem>
                  <SelectItem value="General Health">General Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedentary">Sedentary</SelectItem>
                  <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                  <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                  <SelectItem value="Very Active">Very Active</SelectItem>
                  <SelectItem value="Extremely Active">Extremely Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Dietary Preference</Label>
              <Select value={dietaryPref} onValueChange={setDietaryPref}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="Vegan">Vegan</SelectItem>
                  <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                  <SelectItem value="Pescatarian">Pescatarian</SelectItem>
                  <SelectItem value="Keto">Keto</SelectItem>
                  <SelectItem value="No Preference">No Preference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Summary */}
      {assessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-primary" />
              Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">BMI</p>
                <p className="text-lg font-semibold text-foreground">
                  {assessment.bmi ? Number(assessment.bmi).toFixed(1) : "N/A"}
                </p>
                <Badge
                  variant="secondary"
                  className={
                    assessment.bmi_category === "Normal"
                      ? "w-fit bg-primary/10 text-primary"
                      : "w-fit bg-accent/10 text-accent-foreground"
                  }
                >
                  {assessment.bmi_category || "N/A"}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Sleep</p>
                <p className="text-lg font-semibold text-foreground">
                  {assessment.sleep_hours
                    ? `${Number(assessment.sleep_hours).toFixed(1)}h`
                    : "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Stress Level</p>
                <p className="text-lg font-semibold capitalize text-foreground">
                  {assessment.stress_level || "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Conditions</p>
                <p className="text-lg font-semibold text-foreground">
                  {assessment.health_conditions?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Profile
        </Button>
      </div>
    </div>
  )
}
