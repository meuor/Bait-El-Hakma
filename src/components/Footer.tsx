import { Heart, Github, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap justify-center">
            <span>Created &amp; inspired by</span>
            <span className="font-medium text-foreground">Rajaei Muhammed</span>
            <span>&amp;</span>
            <span className="font-medium text-primary">Kimi AI</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>|</span>
            <span>All back-end to</span>
            <span className="font-medium text-foreground">OpenCode</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <a
                href="mailto:ragaeymuhammed@gmail.com?subject=Bait%20El-Hakma%20Support"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Support</span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com/meuor/Bait-El-Hakma/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Report Issue</span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com/meuor/Bait-El-Hakma"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
          <p>© {new Date().getFullYear()} Bait El-Hakma (House of Wisdom). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
