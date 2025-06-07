
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoInput } from '../schema';
import { updateTodo } from '../handlers/update_todo';
import { eq } from 'drizzle-orm';

describe('updateTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo completion status', async () => {
    // Create a test todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Test todo',
        completed: false
      })
      .returning()
      .execute();

    const testInput: UpdateTodoInput = {
      id: createdTodo[0].id,
      completed: true
    };

    const result = await updateTodo(testInput);

    // Verify the returned todo
    expect(result.id).toEqual(createdTodo[0].id);
    expect(result.text).toEqual('Test todo');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated todo to database', async () => {
    // Create a test todo first
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Another test todo',
        completed: false
      })
      .returning()
      .execute();

    const testInput: UpdateTodoInput = {
      id: createdTodo[0].id,
      completed: true
    };

    await updateTodo(testInput);

    // Query the database to verify the update
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo[0].id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].completed).toEqual(true);
    expect(todos[0].text).toEqual('Another test todo');
  });

  it('should throw error when todo does not exist', async () => {
    const testInput: UpdateTodoInput = {
      id: 999, // Non-existent ID
      completed: true
    };

    await expect(updateTodo(testInput)).rejects.toThrow(/not found/i);
  });

  it('should be able to mark completed todo as incomplete', async () => {
    // Create a completed todo
    const createdTodo = await db.insert(todosTable)
      .values({
        text: 'Completed todo',
        completed: true
      })
      .returning()
      .execute();

    const testInput: UpdateTodoInput = {
      id: createdTodo[0].id,
      completed: false
    };

    const result = await updateTodo(testInput);

    expect(result.completed).toEqual(false);
    expect(result.text).toEqual('Completed todo');
  });
});
