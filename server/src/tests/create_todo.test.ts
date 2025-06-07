
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  text: 'Test todo item'
};

describe('createTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo', async () => {
    const result = await createTodo(testInput);

    // Basic field validation
    expect(result.text).toEqual('Test todo item');
    expect(result.completed).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save todo to database', async () => {
    const result = await createTodo(testInput);

    // Query using proper drizzle syntax
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].text).toEqual('Test todo item');
    expect(todos[0].completed).toEqual(false);
    expect(todos[0].created_at).toBeInstanceOf(Date);
  });

  it('should set completed to false by default', async () => {
    const result = await createTodo(testInput);

    expect(result.completed).toEqual(false);
  });

  it('should handle longer todo text', async () => {
    const longTextInput: CreateTodoInput = {
      text: 'This is a much longer todo item that tests the text field can handle more content'
    };

    const result = await createTodo(longTextInput);

    expect(result.text).toEqual(longTextInput.text);
    expect(result.completed).toEqual(false);
    expect(result.id).toBeDefined();
  });
});
