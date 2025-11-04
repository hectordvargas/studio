'use server';

/**
 * @fileOverview Ranks candidates based on their suitability for a job, considering profile analysis,
 * assessment scores, and interview performance.
 *
 * - rankCandidates - A function that ranks candidates based on the provided input.
 * - RankCandidatesInput - The input type for the rankCandidates function.
 * - RankedCandidate - The output type for the rankCandidates function, representing a single ranked candidate.
 * - RankCandidatesOutput - The output type for the rankCandidates function, representing an array of ranked candidates.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CandidateProfileSchema = z.object({
  candidateId: z.string().describe('Unique identifier for the candidate.'),
  profileAnalysis: z
    .string()
    .describe('Analysis of the candidate profile against the job description.'),
  assessmentScore: z
    .number()
    .describe('Overall score from psychometric and technical assessments.'),
  interviewPerformance: z
    .string()
    .describe('Feedback and evaluation of the candidate interview.'),
});

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

const RankCandidatesInputSchema = z.object({
  jobDescription: z.string().describe('The job description for the role.'),
  candidates: z.array(CandidateProfileSchema).describe('Array of candidate profiles.'),
});

export type RankCandidatesInput = z.infer<typeof RankCandidatesInputSchema>;

const RankedCandidateSchema = CandidateProfileSchema.extend({
  rank: z.number().describe('The rank of the candidate (1 being the highest).'),
  suitabilityScore: z.number().describe('A score indicating overall suitability for the role.'),
  justification: z
    .string()
    .describe('Explanation of why the candidate received the assigned rank and score.'),
});

export type RankedCandidate = z.infer<typeof RankedCandidateSchema>;

const RankCandidatesOutputSchema = z.array(RankedCandidateSchema);

export type RankCandidatesOutput = z.infer<typeof RankCandidatesOutputSchema>;

export async function rankCandidates(input: RankCandidatesInput): Promise<RankCandidatesOutput> {
  return rankCandidatesFlow(input);
}

const rankCandidatesPrompt = ai.definePrompt({
  name: 'rankCandidatesPrompt',
  input: {schema: RankCandidatesInputSchema},
  output: {schema: RankCandidatesOutputSchema},
  prompt: `You are an expert talent acquisition specialist. Your task is to rank candidates based on their suitability for a given job description.

You will receive a job description and an array of candidate profiles, each including a profile analysis, assessment score, and interview performance review.  You should consider all these factors in determining the rank and suitability score. Provide a justification for each candidate's ranking.

Job Description: {{{jobDescription}}}

Candidate Profiles:
{{#each candidates}}
Candidate ID: {{{candidateId}}}
Profile Analysis: {{{profileAnalysis}}}
Assessment Score: {{{assessmentScore}}}
Interview Performance: {{{interviewPerformance}}}
{{/each}}

Output the ranked candidates in JSON format, including the rank, suitability score, and justification for each candidate.
Ensure that the candidate with the highest suitability receives a rank of 1.
`, // modified prompt for improved clarity and context
});

const rankCandidatesFlow = ai.defineFlow(
  {
    name: 'rankCandidatesFlow',
    inputSchema: RankCandidatesInputSchema,
    outputSchema: RankCandidatesOutputSchema,
  },
  async input => {
    const {output} = await rankCandidatesPrompt(input);
    return output!;
  }
);
