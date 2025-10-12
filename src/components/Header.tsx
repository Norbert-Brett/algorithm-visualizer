import { Code2, Github } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="h-16 border-b bg-background px-6 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <Code2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Algorithm Visualizer</h1>
          <p className="text-sm text-muted-foreground">Interactive learning platform</p>
        </div>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/about">
          <Button variant="ghost" size="sm">About</Button>
        </Link>
        <Link href="https://github.com/Norbert-Brett/algorithm-visualizer" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub
          </Button>
        </Link>
        <ThemeSwitcher />
      </div>
    </header>
  );
}