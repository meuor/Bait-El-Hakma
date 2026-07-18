import { Heart, Coffee, Github, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Creator Credit */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Created by</span>
            <span className="font-medium text-foreground">Rajaei Muhammed</span>
            <span>with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>&</span>
            <span className="font-medium text-primary">KIMI AI</span>
          </div>

          {/* Support Links */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://ko-fi.com/rajaeimuhammed"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Coffee className="w-4 h-4" />
                <span className="hidden sm:inline">Support</span>
              </a>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
              </a>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
          <p>© {new Date().getFullYear()} Bait El-Hakma (House of Wisdom). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
