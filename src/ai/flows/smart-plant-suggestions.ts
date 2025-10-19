'use server';

/**
 * @fileOverview A smart plant suggestion AI agent.
 *
 * - smartPlantSuggestions - A function that determines if a plant is a good fit for a user's environment and conditions.
 * - SmartPlantSuggestionsInput - The input type for the smartPlantSuggestions function.
 * - SmartPlantSuggestionsOutput - The return type for the smartPlantSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartPlantSuggestionsInputSchema = z.object({
  plantDescription: z.string().describe('A description of the plant, including its needs and characteristics.'),
  environmentDescription: z.string().describe('A description of the user\'s environment, including climate, space, and other relevant factors.'),
});
export type SmartPlantSuggestionsInput = z.infer<typeof SmartPlantSuggestionsInputSchema>;

const SmartPlantSuggestionsOutputSchema = z.object({
  isGoodFit: z.boolean().describe('Whether the plant is a good fit for the described environment.'),
  reasoning: z.string().describe('The AI\'s reasoning for its determination.'),
});
export type SmartPlantSuggestionsOutput = z.infer<typeof SmartPlantSuggestionsOutputSchema>;

export async function smartPlantSuggestions(input: SmartPlantSuggestionsInput): Promise<SmartPlantSuggestionsOutput> {
  return smartPlantSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartPlantSuggestionsPrompt',
  input: {schema: SmartPlantSuggestionsInputSchema},
  output: {schema: SmartPlantSuggestionsOutputSchema},
  prompt: `You are an expert horticulturalist. A user is considering a plant, and you need to determine if it's a good fit.

  Here is a description of the plant:
  {{plantDescription}}

  Here is a description of the user's environment:
  {{environmentDescription}}

  Based on this information, determine if the plant is a good fit for the environment. Explain your reasoning, and then set the isGoodFit field accordingly.

  Consider factors like sunlight, temperature, humidity, space, and soil conditions.
  `,
});

const smartPlantSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartPlantSuggestionsFlow',
    inputSchema: SmartPlantSuggestionsInputSchema,
    outputSchema: SmartPlantSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
