import { useState } from 'react';
import { migrateAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Database, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const DATA_STORAGE_KEY = 'bait-el-hakma-data';

export function MigrateData() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [stats, setStats] = useState<{
    sessions: number;
    cards: number;
    books: number;
    todos: number;
    challenges: number;
  } | null>(null);

  const handleMigrate = async () => {
    setIsMigrating(true);

    try {
      const stored = localStorage.getItem(DATA_STORAGE_KEY);
      if (!stored) {
        toast.error('No local data found to migrate');
        return;
      }

      const data = JSON.parse(stored);

      // Count items
      const migrationStats = {
        sessions: data.pomodoroHistory?.length || 0,
        cards: data.kanbanCards?.length || 0,
        books: data.books?.length || 0,
        todos: data.todos?.length || 0,
        challenges: data.challenges?.length || 0,
      };

      setStats(migrationStats);

      // Migrate data
      await migrateAPI.migrate({
        pomodoroSessions: data.pomodoroHistory,
        kanbanCards: data.kanbanCards,
        books: data.books,
        todos: data.todos,
        challenges: data.challenges,
        settings: data.pomodoroSettings,
      });

      setMigrated(true);
      toast.success('Data migrated successfully!');
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  if (migrated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Migration Complete
          </CardTitle>
          <CardDescription>
            Your data has been successfully migrated to the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="space-y-2 text-sm">
              <p>• {stats.sessions} pomodoro sessions</p>
              <p>• {stats.cards} kanban cards</p>
              <p>• {stats.books} books</p>
              <p>• {stats.todos} todos</p>
              <p>• {stats.challenges} challenges</p>
            </div>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Your local data is still available as a backup.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Migrate Local Data
        </CardTitle>
        <CardDescription>
          Transfer your data from browser storage to the cloud database for cross-device access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>This will migrate:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Pomodoro sessions</li>
              <li>Kanban cards</li>
              <li>Books and notes</li>
              <li>Daily todos</li>
              <li>Challenges</li>
              <li>Settings</li>
            </ul>
          </div>
          <Button 
            onClick={handleMigrate} 
            disabled={isMigrating}
            className="w-full"
          >
            {isMigrating ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Start Migration
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
