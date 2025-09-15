import { JsonEditor } from "@/components/json-editor"

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">JSON Editor</h1>
        <JsonEditor />
      </div>
    </div>
  )
}
