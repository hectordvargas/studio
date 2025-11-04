'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/rank-candidates-based-on-suitability.ts';
import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/analyze-candidate-profiles.ts';
import '@/ai/flows/recommend-suitable-assessments.ts';
import '@/ai/flows/autofill-job-details.ts';
import '@/ai/flows/generate-image-from-text.ts';
