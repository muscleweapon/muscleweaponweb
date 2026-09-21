import { z } from 'zod';

export const batchGenerationSchema = z.object({
  count: z
    .number({
      error: 'Batch count must be a number',
    })
    .int('Batch count must be a whole integer')
    .min(1, 'Minimum batch count is 1')
    .max(5000, 'Maximum batch count is 5,000'),
  note: z.string().max(255).optional(),
});

export type BatchGenerationInput = z.infer<typeof batchGenerationSchema>;
