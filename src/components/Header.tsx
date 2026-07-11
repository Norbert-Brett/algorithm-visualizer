import { Code2, Github } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity min-w-0 group">
        <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center transition-all duration-300 group-hover:bg-accent/15 group-hover:scale-105">
          <Code2 className="h-5 w-5 text-accent flex-shrink-0" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate leading-none sm:leading-tight">
            Algorithm Visualizer
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block font-sans">
            Interactive Computer Science sandbox
          </p>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        <Link href="/about" className="hidden sm:block">
          <Button variant="ghost" size="sm" className="text-xs font-semibold h-8 rounded-full hover:bg-muted/70">
            About
          </Button>
        </Link>
        
        <Link href="https://github.com/Norbert-Brett/algorithm-visualizer" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs font-semibold h-8 rounded-full hover:bg-muted/70 px-3">
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </Button>
        </Link>
        
        <ThemeSwitcher />
      </div>
    </header>
  );
}