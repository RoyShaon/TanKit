import { config } from 'dotenv';
config();

import '@/ai/flows/prompt-for-symptoms.ts';
import '@/ai/flows/suggest-remedies.ts';
import '@/ai/flows/suggest-homeopathic-medicines.ts';