
import { z } from 'zod';

// Todo schema
export const todoSchema = z.object({
  id: z.number(),
  text: z.string(),
  completed: z.boolean(),
  created_at: z.coerce.date()
});

export type Todo = z.infer<typeof todoSchema>;

// Input schema for creating todos
export const createTodoInputSchema = z.object({
  text: z.string().min(1, 'Todo text cannot be empty')
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

// Input schema for updating todo completion status
export const updateTodoInputSchema = z.object({
  id: z.number(),
  completed: z.boolean()
});

export type UpdateTodoInput = z.infer<typeof updateTodoInputSchema>;

// Input schema for deleting todos
export const deleteTodoInputSchema = z.object({
  id: z.number()
});

export type DeleteTodoInput = z.infer<typeof deleteTodoInputSchema>;
