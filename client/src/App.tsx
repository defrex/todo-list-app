
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Todo, CreateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    setIsCreating(true);
    try {
      const input: CreateTodoInput = { text: newTodoText.trim() };
      const newTodo = await trpc.createTodo.mutate(input);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
      setNewTodoText('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updatedTodo = await trpc.updateTodo.mutate({
        id: todo.id,
        completed: !todo.completed
      });
      setTodos((prev: Todo[]) => 
        prev.map((t: Todo) => t.id === todo.id ? updatedTodo : t)
      );
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      await trpc.deleteTodo.mutate({ id: todoId });
      setTodos((prev: Todo[]) => prev.filter((t: Todo) => t.id !== todoId));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const completedCount = todos.filter((t: Todo) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✅ Todo List
          </h1>
          <p className="text-gray-600">
            Stay organized and get things done!
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="pt-6">
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Todo Form */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="flex gap-2">
              <Input
                value={newTodoText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setNewTodoText(e.target.value)
                }
                placeholder="What needs to be done? 🤔"
                className="flex-1"
                disabled={isCreating}
              />
              <Button 
                type="submit" 
                disabled={isCreating || !newTodoText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? '⏳' : '➕'} Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Todo List */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Your Tasks
              {totalCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {completedCount}/{totalCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                Loading your tasks...
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-lg font-medium mb-2">No tasks yet!</p>
                <p className="text-sm">Add your first task above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo: Todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                      todo.completed 
                        ? 'bg-green-50 border-green-200 opacity-75' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium transition-all duration-200 ${
                        todo.completed 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-900'
                      }`}>
                        {todo.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {todo.created_at.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {todo.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Footer */}
        {totalCount > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {completedCount === totalCount 
                ? "🎉 All tasks completed! Great job!" 
                : `Keep going! ${totalCount - completedCount} task${totalCount - completedCount !== 1 ? 's' : ''} remaining.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
