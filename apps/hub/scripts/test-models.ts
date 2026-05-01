import { GoogleGenerativeAI } from '@google/generative-ai'

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
  // In the newer SDKs, listModels might be on the client or require a different approach.
  // We'll try a simple generate call with a common name first to see if we get a better error or success.
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'models/gemini-1.5-flash', 'models/gemini-1.5-pro']
  
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent('hi')
      console.log(`✅ ${modelName} works!`)
    } catch (err) {
      console.log(`❌ ${modelName} failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

listModels()
