"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"

type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

const defaultJson = {
  name: "John Doe",
  age: 30,
  isActive: true,
  address: {
    street: "123 Main St",
    city: "New York",
    zipCode: "10001",
  },
  hobbies: ["reading", "coding", "hiking"],
  metadata: null,
}

export function JsonEditor() {
  const [mode, setMode] = useState<"raw" | "ui">("ui")
  const [jsonData, setJsonData] = useState<JsonValue>(defaultJson)
  const [rawText, setRawText] = useState(JSON.stringify(defaultJson, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [newKey, setNewKey] = useState("") // Moved useState to top level

  const handleModeToggle = useCallback(() => {
    if (mode === "ui") {
      // Switching to raw mode
      setRawText(JSON.stringify(jsonData, null, 2))
      setMode("raw")
    } else {
      // Switching to UI mode
      try {
        const parsed = JSON.parse(rawText)
        setJsonData(parsed)
        setError(null)
        setMode("ui")
      } catch (err) {
        setError("Invalid JSON format")
      }
    }
  }, [mode, jsonData, rawText])

  const handleRawTextChange = useCallback((value: string) => {
    setRawText(value)
    setError(null)
  }, [])

  const updateJsonValue = useCallback((path: string[], value: JsonValue) => {
    setJsonData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev))
      let current = newData

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }

      current[path[path.length - 1]] = value
      return newData
    })
  }, [])

  const deleteJsonKey = useCallback((path: string[]) => {
    setJsonData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev))
      let current = newData

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }

      delete current[path[path.length - 1]]
      return newData
    })
  }, [])

  const addJsonKey = useCallback((path: string[], key: string, value: JsonValue) => {
    setJsonData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev))
      let current = newData

      for (const segment of path) {
        current = current[segment]
      }

      current[key] = value
      return newData
    })
  }, [])

  const renderJsonValue = (value: JsonValue, path: string[] = []): React.ReactNode => {
    if (value === null) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline">null</Badge>
          <Button size="sm" variant="ghost" onClick={() => deleteJsonKey(path)} className="h-6 w-6 p-0">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    if (typeof value === "boolean") {
      return (
        <div className="flex items-center gap-2">
          <select
            value={value.toString()}
            onChange={(e) => updateJsonValue(path, e.target.value === "true")}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
          <Button size="sm" variant="ghost" onClick={() => deleteJsonKey(path)} className="h-6 w-6 p-0">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    if (typeof value === "string" || typeof value === "number") {
      return (
        <div className="flex items-center gap-2">
          <Input
            type={typeof value === "number" ? "number" : "text"}
            value={value}
            onChange={(e) => {
              const newValue = typeof value === "number" ? Number.parseFloat(e.target.value) || 0 : e.target.value
              updateJsonValue(path, newValue)
            }}
            className="h-8"
          />
          <Button size="sm" variant="ghost" onClick={() => deleteJsonKey(path)} className="h-6 w-6 p-0">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Array ({value.length})</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateJsonValue([...path], [...value, ""])}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => deleteJsonKey(path)} className="h-6 w-6 p-0">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="ml-4 space-y-2">
            {value.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <Label className="text-xs text-muted-foreground min-w-8">[{index}]</Label>
                <div className="flex-1">{renderJsonValue(item, [...path, index.toString()])}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (typeof value === "object") {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Object ({Object.keys(value).length})</Badge>
            <Button size="sm" variant="ghost" onClick={() => deleteJsonKey(path)} className="h-6 w-6 p-0">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="ml-4 space-y-2">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="flex items-start gap-2">
                <Label className="text-xs text-muted-foreground min-w-20 font-mono">{key}:</Label>
                <div className="flex-1">{renderJsonValue(val, [...path, key])}</div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                placeholder="New key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="h-8 w-32"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (newKey.trim()) {
                    addJsonKey(path, newKey.trim(), "")
                    setNewKey("")
                  }
                }}
                className="h-8"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant={mode === "raw" ? "default" : "secondary"}>{mode === "raw" ? "Raw JSON" : "UI Editor"}</Badge>
          {error && <Badge variant="destructive">{error}</Badge>}
        </div>
        <Button onClick={handleModeToggle} variant="outline">
          Switch to {mode === "raw" ? "UI" : "Raw"} Mode
        </Button>
      </div>

      {mode === "raw" ? (
        <Textarea
          value={rawText}
          onChange={(e) => handleRawTextChange(e.target.value)}
          className="min-h-96 font-mono text-sm"
          placeholder="Enter JSON here..."
        />
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">{renderJsonValue(jsonData)}</div>
      )}
    </Card>
  )
}
