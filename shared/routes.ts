import { z } from 'zod';
import { insertContractSchema, insertChatSessionSchema, contracts, analyses, contractFiles, chatSessions, chatMessages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  contracts: {
    list: {
      method: 'GET' as const,
      path: '/api/contracts' as const,
      responses: {
        200: z.array(z.custom<typeof contracts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/contracts/:id' as const,
      responses: {
        200: z.custom<typeof contracts.$inferSelect & { files: typeof contractFiles.$inferSelect[], analyses: typeof analyses.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/contracts' as const,
      input: insertContractSchema,
      responses: {
        201: z.custom<typeof contracts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    uploadFile: {
      method: 'POST' as const,
      path: '/api/contracts/:id/files' as const,
      // Input is multipart/form-data, handled via express middleware, metadata in body
      input: z.object({
        fileType: z.enum(["contract", "requirements", "code"]),
      }),
      responses: {
        201: z.custom<typeof contractFiles.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/contracts/:id/analyze' as const,
      responses: {
        200: z.object({ message: z.string(), analysisId: z.number() }),
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
    getAnalysis: {
      method: 'GET' as const,
      path: '/api/analyses/:id' as const,
      responses: {
        200: z.custom<typeof analyses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  sessions: {
    create: {
      method: 'POST' as const,
      path: '/api/sessions' as const,
      input: insertChatSessionSchema,
      responses: {
        201: z.custom<typeof chatSessions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/sessions/:id' as const,
      responses: {
        200: z.custom<typeof chatSessions.$inferSelect & { messages: typeof chatMessages.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/sessions' as const,
      responses: {
        200: z.array(z.custom<typeof chatSessions.$inferSelect>()),
      },
    },
    sendMessage: {
      method: 'POST' as const,
      path: '/api/sessions/:id/messages' as const,
      input: z.object({
        content: z.string(),
      }),
      responses: {
        200: z.object({
          userMessage: z.custom<typeof chatMessages.$inferSelect>(),
          assistantMessage: z.custom<typeof chatMessages.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
    generateScore: {
      method: 'POST' as const,
      path: '/api/sessions/:id/generate-score' as const,
      responses: {
        200: z.object({
          score: z.number(),
          report: z.any(),
          message: z.custom<typeof chatMessages.$inferSelect>(),
        }),
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

