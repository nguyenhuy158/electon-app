import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db } from '../db';
import { clips } from '../db/schema';
import { desc } from 'drizzle-orm';

const t = initTRPC.create({ isServer: true });

export const router = t.router({
  getClips: t.procedure.query(async () => {
    return await db.query.clips.findMany({
      orderBy: [desc(clips.createdAt)],
      limit: 50,
    });
  }),
  saveClip: t.procedure.input(z.object({ content: z.string() })).mutation(async ({ input }) => {
    return await db
      .insert(clips)
      .values({
        content: input.content,
        userId: 'guest',
      })
      .returning();
  }),
});

export type AppRouter = typeof router;
