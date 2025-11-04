'use server';

/**
 * @fileOverview Generates competency-based interview questions, both generic and tailored to individual candidates.
 *
 * - generateInterviewQuestions - A function that generates interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  jobDescription: z.string().describe('The description of the job.'),
  candidateProfile: z.string().describe('The profile of the candidate.'),
  genericQuestionsCount: z.number().describe('The number of generic competency-based questions to generate.'),
  tailoredQuestionsCount: z.number().describe('The number of tailored questions to generate based on the candidate profile.'),
});

export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  genericQuestions: z.array(z.string()).describe('The generated generic competency-based interview questions.'),
  tailoredQuestions: z.array(z.string()).describe('The generated tailored interview questions based on the candidate profile.'),
});

export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

export async function generateInterviewQuestions(input: GenerateInterviewQuestionsInput): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert HR interviewer.

You will generate {{genericQuestionsCount}} generic competency-based interview questions suitable for the job described below. These questions should assess common competencies like teamwork, problem-solving, communication, and adaptability.

Job Description: {{{jobDescription}}}

You will also generate {{tailoredQuestionsCount}} interview questions specifically tailored to the candidate's profile below. These questions should explore the candidate's skills, experience, and potential fit with the job requirements, drawing insights from the candidate profile.

Candidate Profile: {{{candidateProfile}}}

Ensure that the generated questions are clear, concise, and relevant to both the job description and the candidate's profile. Your response should contain two arrays of questions; 'genericQuestions' and 'tailoredQuestions'. The questions should be engaging and insightful, designed to reveal the candidate's strengths, weaknesses, and overall suitability for the position.

Output the response in JSON format.
`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
