
'use server';

/**
 * @fileOverview Analyzes candidate profiles against job descriptions using AI to identify skill matches and gaps.
 *
 * - analyzeCandidateProfile - A function that handles the candidate profile analysis process.
 * - AnalyzeCandidateProfileInput - The input type for the analyzeCandidateProfile function.
 * - AnalyzeCandidateProfileOutput - The return type for the analyzeCandidateProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCandidateProfileInputSchema = z.object({
  candidateProfile: z
    .string()
    .describe('The complete profile of the candidate.'),
  jobDescription: z
    .string()
    .describe('The job description for the position.'),
  language: z.enum(['es', 'en']).optional().default('es').describe('The language for the analysis output (Spanish or English).'),
});
export type AnalyzeCandidateProfileInput = z.infer<typeof AnalyzeCandidateProfileInputSchema>;

const AnalyzeCandidateProfileOutputSchema = z.object({
  suitabilityScore: z
    .number()
    .describe("A percentage score (0-100) representing the candidate's suitability for the job, based on the analysis of their profile against the job description."),
  skillMatches: z
    .array(z.string())
    .describe('Skills from the candidate profile that match the job description.'),
  skillGaps: z
    .array(z.string())
    .describe('Skills required in the job description but missing from the candidate profile.'),
  summary: z
    .string()
    .describe('A summary of the candidate profile in relation to the job description.'),
  suggestions: z
    .array(z.string())
    .describe('Concrete suggestions or next steps for this candidate, such as specific training or areas to focus on during the interview.'),
  recommendedQuestions: z
    .array(z.string())
    .describe("Recommended interview questions to validate the candidate's skills and explore the identified gaps."),
});
export type AnalyzeCandidateProfileOutput = z.infer<typeof AnalyzeCandidateProfileOutputSchema>;

export async function analyzeCandidateProfile(
  input: AnalyzeCandidateProfileInput
): Promise<AnalyzeCandidateProfileOutput> {
  return analyzeCandidateProfileFlow(input);
}

const analyzeCandidateProfilePrompt = ai.definePrompt({
  name: 'analyzeCandidateProfilePrompt',
  input: {schema: AnalyzeCandidateProfileInputSchema},
  output: {schema: AnalyzeCandidateProfileOutputSchema},
  prompt: `You are an AI expert in Human Resources, specializing in matching candidates to job descriptions.

  Generate the analysis in the following language: {{{language}}}.

  Analyze the candidate profile against the job description to identify skill matches and gaps.
  Provide a summary of the candidate's suitability for the role.

  Candidate Profile: {{{candidateProfile}}}
  Job Description: {{{jobDescription}}}

  Based on the provided information, extract the following:
  - suitabilityScore: A percentage score (from 0 to 100) representing how suitable the candidate is for the role based on the provided profile and job description. Be strict and realistic with the score.
  - skillMatches: Skills from the candidate profile that align with the job description. Ensure that these skills are concrete and evident in the candidate profile.
  - skillGaps: Skills or qualifications listed in the job description that are not apparent or mentioned in the candidate profile.
  - summary: A concise summary of the candidate's strengths and weaknesses relative to the job requirements. Highlight any standout qualities or significant areas for improvement.
  - suggestions: Concrete suggestions or next steps for this candidate, such as specific training or areas to focus on during the interview.
  - recommendedQuestions: Recommended interview questions to validate the candidate's skills and explore the identified gaps.

  Ensure the output is formatted correctly according to the output schema provided.`,
});

const analyzeCandidateProfileFlow = ai.defineFlow(
  {
    name: 'analyzeCandidateProfileFlow',
    inputSchema: AnalyzeCandidateProfileInputSchema,
    outputSchema: AnalyzeCandidateProfileOutputSchema,
  },
  async input => {
    const {output} = await analyzeCandidateProfilePrompt(input);
    return output!;
  }
);
