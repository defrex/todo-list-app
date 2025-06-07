
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteTodo = async (input: DeleteTodoInput): Promise<void> => {
  try {
    await db.delete(todosTable)
      .where(eq(todosTable.id, input.id))
      .execute();
  } catch (error) {
    console.error('Todo deletion failed:', error);
    throw error;
  }
};
