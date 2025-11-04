'use server';

/**
 * @fileOverview Autofills job details by analyzing a job description text using AI.
 *
 * - autofillJobDetails - A function that handles the job detail extraction process.
 * - AutofillJobDetailsInput - The input type for the autofillJobDetails function.
 * - AutofillJobDetailsOutput - The return type for the autofillJobDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AutofillJobDetailsInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The full text of the job description to be analyzed.'),
});
export type AutofillJobDetailsInput = z.infer<
  typeof AutofillJobDetailsInputSchema
>;

const AutofillJobDetailsOutputSchema = z.object({
  title: z.string().optional().describe('The job title.'),
  description: z.string().optional().describe('A summary of the job description.'),
  responsibilities: z
    .array(z.object({ value: z.string() }))
    .optional()
    .describe('List of job responsibilities.'),
  requirements: z
    .array(z.object({ value: z.string() }))
    .optional()
    .describe('List of job requirements.'),
  competencies: z
    .array(z.object({ value: z.string() }))
    .optional()
    .describe('List of required competencies.'),
  languages: z
    .array(z.object({ name: z.string(), level: z.string() }))
    .optional()
    .describe('List of required languages and proficiency levels.'),
  experience: z.string().optional().describe('Required years of experience.'),
  education: z
    .object({
      level: z.string().optional(),
      career: z.string().optional(),
    })
    .optional()
    .describe('Education level and field of study.'),
  benefits: z
    .array(z.object({ value: z.string() }))
    .optional()
    .describe('List of benefits offered.'),
});
export type AutofillJobDetailsOutput = z.infer<
  typeof AutofillJobDetailsOutputSchema
>;

export async function autofillJobDetails(
  input: AutofillJobDetailsInput
): Promise<AutofillJobDetailsOutput> {
  return autofillJobDetailsFlow(input);
}

const autofillJobDetailsPrompt = ai.definePrompt({
  name: 'autofillJobDetailsPrompt',
  input: { schema: AutofillJobDetailsInputSchema },
  output: { schema: AutofillJobDetailsOutputSchema },
  prompt: `You are an expert HR assistant. Analyze the following job description and extract the relevant information into a structured JSON format.

Job Description:
{{{jobDescription}}}

Extract the following fields:
- title: The job title.
- description: A brief summary of the role.
- responsibilities: A list of the main responsibilities.
- requirements: A list of the key qualifications and requirements.
- competencies: A list of soft and hard skills required.
- languages: A list of languages required and the proficiency level.
- experience: The required years or level of professional experience.
- education: The required academic level and career.
- benefits: A list of benefits or perks offered.

Be concise and accurate. If a field is not mentioned, omit it.
`,
});

const autofillJobDetailsFlow = ai.defineFlow(
  {
    name: 'autofillJobDetailsFlow',
    inputSchema: AutofillJobDetailsInputSchema,
    outputSchema: AutofillJobDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await autofillJobDetailsPrompt(input);
    return output!;
  }
);
