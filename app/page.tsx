'use client'

import { useState } from 'react'

interface PlantInfo {
  commonName: string;
  scientificName: string;
  description: string;
  careInstructions: string;
  idealConditions: string;
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset states
    setLoading(true)
    setError(null)
    setPlantInfo(null)

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      setLoading(false)
      return
    }

    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const base64String = reader.result as string
        setImage(base64String)

        const response = await fetch('/api/identify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64String }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to identify plant')
        }

        setPlantInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process image')
      } finally {
        setLoading(false)
      }
    }

    reader.onerror = () => {
      setError('Error reading file')
      setLoading(false)
    }

    reader.readAsDataURL(file)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-8">
          Plant Identifier
        </h1>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <label className="flex flex-col items-center w-full p-6 bg-green-50 text-green-700 rounded-lg border-2 border-green-200 border-dashed cursor-pointer hover:bg-green-100 transition-colors">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm">Upload a plant image</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
              disabled={loading}
            />
          </label>

          {loading && (
            <div className="text-center mt-4 text-green-600">
              <div className="animate-pulse">Analyzing your plant...</div>
            </div>
          )}

          {error && (
            <div className="text-center mt-4 text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {image && plantInfo && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative h-[300px] rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt="Uploaded plant"
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-green-800">
                  {plantInfo.commonName}
                </h2>
                <p className="text-gray-600 italic">
                  {plantInfo.scientificName}
                </p>
                
                <div>
                  <h3 className="font-semibold text-green-700">Description</h3>
                  <p className="text-gray-700">{plantInfo.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-green-700">Care Instructions</h3>
                  <p className="text-gray-700">{plantInfo.careInstructions}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-green-700">Ideal Conditions</h3>
                  <p className="text-gray-700">{plantInfo.idealConditions}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}