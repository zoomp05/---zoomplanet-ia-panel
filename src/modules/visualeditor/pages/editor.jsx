//import { Card } from '@/components/ui/card';
import VisualEditor from '../components/VisualEditor';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-xl font-semibold">Editor de Layout</h1>
      </header>
      
      <main className="container mx-auto py-6">
        
          <VisualEditor />
        
      </main>
      
      <footer className="mt-auto border-t bg-white px-6 py-4 text-center text-sm text-gray-600">
        Editor de Layout © 2024
      </footer>
    </div>
  );
}