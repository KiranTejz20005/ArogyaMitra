"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface TrackMetricModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    type: "water_liters" | "sleep_hours" | "weight_kg"
    title: string
    unit: string
    defaultValue?: number
}

export function TrackMetricModal({
    isOpen,
    onClose,
    onSuccess,
    type,
    title,
    unit,
    defaultValue,
}: TrackMetricModalProps) {
    const [value, setValue] = useState(defaultValue?.toString() || "")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!value || isNaN(Number(value))) {
            toast.error("Please enter a valid number")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch("/api/backend/progress", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    entry_type: type,
                    value: Number(value),
                    unit: unit,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to save progress")
            }

            toast.success(`${title} updated successfully`)
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error saving progress:", error)
            toast.error("An error occurred while saving. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update {title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="metric-value">
                            {title} ({unit})
                        </Label>
                        <Input
                            id="metric-value"
                            type="number"
                            step="0.1"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={`Enter your ${title.toLowerCase()}`}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
