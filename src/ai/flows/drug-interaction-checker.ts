'use server';

/**
 * @fileOverview Checks for potential drug interactions using a given drug name.
 *
 * - checkDrugInteractions - A function that takes a drug name and returns a list of potential drug interactions.
 * - DrugInteractionCheckerInput - The input type for the checkDrugInteractions function.
 * - DrugInteractionCheckerOutput - The return type for the checkDrugInteractions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DrugInteractionCheckerInputSchema = z.object({
  drugName: z.string().describe('The name of the drug to check for interactions.'),
});
export type DrugInteractionCheckerInput = z.infer<typeof DrugInteractionCheckerInputSchema>;

const DrugInteractionCheckerOutputSchema = z.object({
  interactions: z
    .array(z.string())
    .describe('A list of potential drug interactions for the given drug.'),
});
export type DrugInteractionCheckerOutput = z.infer<typeof DrugInteractionCheckerOutputSchema>;

export async function checkDrugInteractions(input: DrugInteractionCheckerInput): Promise<DrugInteractionCheckerOutput> {
  return drugInteractionCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'drugInteractionCheckerPrompt',
  input: {schema: DrugInteractionCheckerInputSchema},
  output: {schema: DrugInteractionCheckerOutputSchema},
  prompt: `You are a pharmacist. A user has selected the drug "{{{drugName}}}". Please list any potential drug interactions with that drug.`,
});

const drugInteractionCheckerFlow = ai.defineFlow(
  {
    name: 'drugInteractionCheckerFlow',
    inputSchema: DrugInteractionCheckerInputSchema,
    outputSchema: DrugInteractionCheckerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
