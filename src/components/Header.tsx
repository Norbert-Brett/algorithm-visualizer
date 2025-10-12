import { Code2, Github } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="h-16 border-b bg-background px-3 sm:px-6 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-0">
        <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">Algorithm Visualizer</h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Interactive learning platform</p>
        </div>
      </Link>
      <div className="flex items-center gap-1 sm:gap-4">
        <Link href="/about" className="hidden sm:block">
          <Button variant="ghost" size="sm">About</Button>
        </Link>
        <Link href="https://github.com/Norbert-Brett/algorithm-visualizer" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </Button>
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
}