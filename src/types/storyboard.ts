import { z } from "zod";

export const SceneSchema = z.object({
  index: z.number(),
  durationSeconds: z.number(),
  visualPrompt: z.string(),
  motionStyle: z.string().optional(),
  audioPrompt: z.string().optional(),
  voiceoverText: z.string(),
  captionText: z.string().optional(),
});

export const StoryboardSchema = z.object({
  title: z.string(),
  totalDurationSeconds: z.number(),
  suggestedMood: z.string(),
  scenes: z.array(SceneSchema),
  thumbnailPrompt: z.string().optional(),
});

export type Scene = z.infer<typeof SceneSchema>;
export type Storyboard = z.infer<typeof StoryboardSchema>;
