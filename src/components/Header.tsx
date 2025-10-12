import { Code2 } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header() {
  return (
    <header className="h-16 border-b bg-background px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Code2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Algorithm Visualizer</h1>
          <p className="text-sm text-muted-foreground">Interactive learning platform</p>
        </div>
      </div>
      <ThemeSwitcher />
    </header>
  );
}