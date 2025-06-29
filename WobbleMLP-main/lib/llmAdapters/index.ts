import * as openai from './openai'
import * as anthropic from './anthropic'
import * as mistral from './mistral'

export const adapters = { openai, anthropic, mistral }
export default adapters
