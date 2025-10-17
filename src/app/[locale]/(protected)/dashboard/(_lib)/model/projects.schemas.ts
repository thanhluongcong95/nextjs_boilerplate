import { z } from 'zod';

// Schema cho creator/user object
const creatorSchema = z.object({
  id: z.string(),
  email: z.string().min(1),
  fullName: z.string(),
  role: z.string(),
  createdAt: z.string(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  imageUrl: z.string().min(1).nullable().optional(),
  avatar: z.string().min(1).nullable().optional(),
  creatorId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  participantIds: z.array(z.string()).optional(),
  creator: creatorSchema.optional(),
});

// API response wrapper schema
export const apiResponseWrapperSchema = z.object({
  status_code: z.number(),
  message: z.string(),
  success: z.boolean(),
  body: z.object({
    docs: z.array(projectSchema),
    totalDocs: z.number().nonnegative(),
    limit: z.number().int().positive(),
    totalPages: z.number().nonnegative(),
    page: z.number().int().positive(),
    pagingCounter: z.number().int().nonnegative(),
    hasPrevPage: z.boolean(),
    hasNextPage: z.boolean(),
    prevPage: z.number().int().nullable(),
    nextPage: z.number().int().nullable(),
  }),
});

// Internal schema for projects list (transformed from API response)
export const projectListResponseSchema = z.object({
  items: z.array(projectSchema),
  total: z.number().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().nonnegative(),
  hasPrevPage: z.boolean(),
  hasNextPage: z.boolean(),
  prevPage: z.number().int().nullable(),
  nextPage: z.number().int().nullable(),
});

// Transform API response to internal format
export function transformProjectListResponse(apiResponse: z.infer<typeof apiResponseWrapperSchema>): z.infer<typeof projectListResponseSchema> {
  const { body } = apiResponse;
  return {
    items: body.docs,
    total: body.totalDocs,
    page: body.page,
    pageSize: body.limit,
    totalPages: body.totalPages,
    hasPrevPage: body.hasPrevPage,
    hasNextPage: body.hasNextPage,
    prevPage: body.prevPage,
    nextPage: body.nextPage,
  };
}

const fileSchema = typeof File === 'undefined' ? z.never() : z.instanceof(File);
const imageInputSchema = z.union([fileSchema, z.string()]);

export const createProjectPayloadSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  image: imageInputSchema.optional().nullable(),
});

export const updateProjectPayloadSchema = createProjectPayloadSchema.partial();

// Schema cho response khi create/update project
export const createProjectResponseSchema = z.object({
  status_code: z.number(),
  message: z.string(),
  success: z.boolean(),
  body: projectSchema,
});

export type TProject = z.infer<typeof projectSchema>;
export type TProjectListResponse = z.infer<typeof projectListResponseSchema>;
export type TCreateProjectPayload = z.infer<typeof createProjectPayloadSchema>;
export type TUpdateProjectPayload = z.infer<typeof updateProjectPayloadSchema>;
export type TCreateProjectResponse = z.infer<typeof createProjectResponseSchema>;
