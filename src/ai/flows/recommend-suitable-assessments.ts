'use server';
/**
 * @fileOverview Recommends suitable psychometric and technical evaluations for a job role.
 *
 * - recommendSuitableAssessments - A function that recommends suitable assessments for a job role.
 * - RecommendSuitableAssessmentsInput - The input type for the recommendSuitableAssessments function.
 * - RecommendSuitableAssessmentsOutput - The return type for the recommendSuitableAssessments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSuitableAssessmentsInputSchema = z.object({
  jobDescription: z.string().describe('The description of the job role.'),
});
export type RecommendSuitableAssessmentsInput = z.infer<typeof RecommendSuitableAssessmentsInputSchema>;

const RecommendSuitableAssessmentsOutputSchema = z.object({
  assessments: z.array(z.string()).describe('The list of recommended assessments.'),
});
export type RecommendSuitableAssessmentsOutput = z.infer<typeof RecommendSuitableAssessmentsOutputSchema>;

export async function recommendSuitableAssessments(input: RecommendSuitableAssessmentsInput): Promise<RecommendSuitableAssessmentsOutput> {
  return recommendSuitableAssessmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSuitableAssessmentsPrompt',
  input: {schema: RecommendSuitableAssessmentsInputSchema},
  output: {schema: RecommendSuitableAssessmentsOutputSchema},
  prompt: `You are an AI assistant helping HR managers to find the best assessments for a given job role.\n\nGiven the following job description, recommend a list of suitable psychometric and technical evaluations.\n\nJob Description: {{{jobDescription}}}\n\nAssessments:`,
});

const recommendSuitableAssessmentsFlow = ai.defineFlow(
  {
    name: 'recommendSuitableAssessmentsFlow',
    inputSchema: RecommendSuitableAssessmentsInputSchema,
    outputSchema: RecommendSuitableAssessmentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
