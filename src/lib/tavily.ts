import { tavily } from '@tavily/core'

const apiKey = process.env.TAVILY_API_KEY

if (!apiKey) {
  console.warn('TAVILY_API_KEY no encontrada en variables de entorno.')
}

const client = apiKey ? tavily({ apiKey }) : null

export const searchWeb = async (
  query: string,
  maxResults: number = 3
) => {
  if (!client) {
    return { answer: 'Servicio de búsqueda no disponible.', results: [] }
  }

  try {
    const response = await client.search(query, {
      maxResults,
      searchDepth: 'basic',
      includeAnswer: true
    })

    return {
      answer: response.answer || '',
      results: response.results.map(r => ({
        title: r.title,
        url: r.url,
        content: r.content?.slice(0, 300)
      }))
    }
  } catch (error) {
    console.error('Tavily error:', error)
    return { answer: '', results: [] }
  }
}
