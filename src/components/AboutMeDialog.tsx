import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Github, Globe, MapPin, GraduationCap, Sparkles } from 'lucide-react';
import { asset } from '@/lib/assets';

interface AboutMeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutMeDialog({ open, onOpenChange }: AboutMeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>About Me</DialogTitle>
          <DialogDescription>RAGAEY M. RAGAA — Creator of Bait El-Hakma</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center text-center gap-4 py-2">
          <img
            src={asset("/img/about-me.jpg")}
            alt="RAGAEY M. RAGAA"
            className="w-36 h-36 rounded-full object-cover border-4 border-primary/30 shadow-lg"
          />
          <div>
            <h3 className="text-xl font-bold">RAGAEY M. RAGAA</h3>
            <p className="text-sm text-muted-foreground">Software Developer & Learner</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>From Alexandria, Egypt</span>
          </div>
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>30 years old, studying Computer Science</span>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>
              Passionate about programming (Python, React, Vite, JavaScript, desktop apps),
              Linux & Windows customization, UI/UX design and branding, artificial intelligence,
              English learning, and building productivity systems & study tools.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Github className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>Projects: ENAR5000 (English learning platform), TimelineVideos (PyQt video study app),
              ClearlyFocus (productivity suite), and Bait-El-Hakma.</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <a
            href="https://github.com/meuor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Github className="w-4 h-4" />
            My GitHub
          </a>
          <a
            href="https://bait-el-hakma.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Globe className="w-4 h-4" />
            Bait El-Hakma Web App
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
