import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Home } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              About Algorithm Visualizer
            </h1>
            <p className="text-xl text-muted-foreground">
              An interactive platform for learning algorithms and data
              structures through visualization
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                What is Algorithm Visualizer?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Algorithm Visualizer is an interactive educational tool designed
                to help students, developers, and computer science enthusiasts
                understand complex algorithms and data structures through
                dynamic visual representations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By providing step-by-step animations and interactive controls,
                this platform makes abstract concepts more tangible and easier
                to comprehend. Whether you&apos;re learning sorting algorithms,
                exploring graph traversals, or understanding tree operations,
                our visualizations break down each process into digestible,
                visual steps.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Interactive algorithm visualizations with step-by-step
                  execution
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Customizable input data and algorithm parameters
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Speed controls for detailed analysis or quick overviews
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Dark and light theme support for comfortable viewing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Responsive design that works on desktop and mobile devices
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inspiration</CardTitle>
              <CardDescription>
                Standing on the shoulders of giants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This project was inspired by the excellent work of David Galles
                and his Data Structure Visualizations at the University of San
                Francisco. His pioneering approach to algorithm education
                through interactive visualizations has helped countless students
                understand complex computer science concepts.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  Visit the original:
                </span>
                <Link
                  href="https://www.cs.usfca.edu/~galles/visualization/Algorithms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  CS USF Algorithm Visualizations
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Source</CardTitle>
              <CardDescription>
                Built with modern web technologies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This project is open source and built with Next.js, React,
                TypeScript, and Tailwind CSS. We believe in the power of open
                source education and welcome contributions from the community.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="https://github.com/Norbert-Brett/algorithm-visualizer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <Link href="/">
              <Button size="lg" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Start Visualizing
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
