
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput, type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

// Test input for creating todos
const testCreateInput: CreateTodoInput = {
  text: 'Test todo for deletion'
};

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a todo first
    const createResult = await db.insert(todosTable)
      .values({
        text: testCreateInput.text,
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = createResult[0];
    
    // Delete the todo
    const deleteInput: DeleteTodoInput = {
      id: createdTodo.id
    };

    await deleteTodo(deleteInput);

    // Verify the todo was deleted
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo.id))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should not affect other todos when deleting one', async () => {
    // Create multiple todos
    const createResult1 = await db.insert(todosTable)
      .values({
        text: 'First todo',
        completed: false
      })
      .returning()
      .execute();

    const createResult2 = await db.insert(todosTable)
      .values({
        text: 'Second todo',
        completed: true
      })
      .returning()
      .execute();

    const firstTodo = createResult1[0];
    const secondTodo = createResult2[0];

    // Delete only the first todo
    const deleteInput: DeleteTodoInput = {
      id: firstTodo.id
    };

    await deleteTodo(deleteInput);

    // Verify first todo is deleted
    const deletedTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, firstTodo.id))
      .execute();

    expect(deletedTodos).toHaveLength(0);

    // Verify second todo still exists
    const remainingTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, secondTodo.id))
      .execute();

    expect(remainingTodos).toHaveLength(1);
    expect(remainingTodos[0].text).toEqual('Second todo');
    expect(remainingTodos[0].completed).toBe(true);
  });

  it('should handle deletion of non-existent todo without error', async () => {
    const deleteInput: DeleteTodoInput = {
      id: 999 // Non-existent ID
    };

    // Should not throw an error
    await expect(deleteTodo(deleteInput)).resolves.toBeUndefined();

    // Verify no todos exist in the database
    const allTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(allTodos).toHaveLength(0);
  });
});
