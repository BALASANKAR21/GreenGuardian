'use server';
/**
 * @fileOverview Plant identification AI agent.
 *
 * - identifyPlant - A function that handles the plant identification process.
 * - PlantIdentificationInput - The input type for the identifyPlant function.
 * - PlantIdentificationOutput - The return type for the identifyPlant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlantIdentificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PlantIdentificationInput = z.infer<typeof PlantIdentificationInputSchema>;

const PlantIdentificationOutputSchema = z.object({
  commonName: z.string().describe('The common name of the identified plant.'),
  scientificName: z.string().describe('The scientific name of the identified plant.'),
  probability: z.number().describe('The probability of the identification being correct (0-1).'),
});
export type PlantIdentificationOutput = z.infer<typeof PlantIdentificationOutputSchema>;

export async function identifyPlant(input: PlantIdentificationInput): Promise<PlantIdentificationOutput> {
  return identifyPlantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPlantPrompt',
  input: {schema: PlantIdentificationInputSchema},
  output: {schema: PlantIdentificationOutputSchema},
  prompt: `You are an expert botanist specializing in identifying plant species from images.

  Analyze the image and identify the plant species, providing both the common and scientific names, and the probability of the identification being correct.

  Image: {{media url=photoDataUri}}

  Ensure that the output is a valid JSON object.`,
});

const identifyPlantFlow = ai.defineFlow(
  {
    name: 'identifyPlantFlow',
    inputSchema: PlantIdentificationInputSchema,
    outputSchema: PlantIdentificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
