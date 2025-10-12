# 🎯 Algorithm Visualizer

A comprehensive, interactive web application for visualizing computer science algorithms and data structures. Built with Next.js, TypeScript, and Framer Motion for smooth animations.

![Algorithm Visualizer](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-New_York-000000?style=for-the-badge)

## 🚀 Features

### ✅ Currently Implemented (13/58 algorithms)

#### **Basic Data Structures**

- 📚 **Stack** - LIFO data structure with push/pop operations
- 📋 **Queue** - FIFO data structure with enqueue/dequeue operations

#### **Tree Data Structures**

- 🌳 **Binary Search Tree (BST)** - Ordered binary tree with search, insert, delete
- 🌲 **B-Tree** - Multi-way balanced tree for databases and file systems

#### **Search Algorithms**

- 🔍 **Linear Search** - Sequential search through array elements
- 🎯 **Binary Search** - Efficient search on sorted arrays
- 🕸️ **Depth-First Search (DFS)** - Graph traversal using stack (LIFO)
- 🌊 **Breadth-First Search (BFS)** - Graph traversal using queue (FIFO)

#### **Sorting Algorithms**

- 🫧 **Bubble Sort** - Simple comparison-based sorting
- 📊 **Selection Sort** - In-place comparison sorting
- 🔀 **Merge Sort** - Divide and conquer sorting algorithm
- 🏔️ **Heap Sort** - Heap-based sorting algorithm
- 🔢 **Radix Sort** - Non-comparison digit-based sorting

### 🚧 Coming Soon (45 more algorithms)

<details>
<summary>View Full Algorithm Roadmap</summary>

#### **Advanced Tree Structures**

- AVL Tree, Red-Black Tree, Splay Tree, B+ Tree, Trie, Radix Tree, Ternary Search Tree

#### **Hash Tables**

- Open Hash Table, Closed Hash Table, Bucket Hash Table

#### **Advanced Sorting**

- Insertion Sort, Shell Sort, Quick Sort, Bucket Sort, Counting Sort

#### **Graph Algorithms**

- Connected Components, Dijkstra's Algorithm, Prim's MST, Kruskal's MST, Topological Sort, Floyd-Warshall

#### **Dynamic Programming**

- Fibonacci Sequence, Making Change, Longest Common Subsequence, 0/1 Knapsack

#### **Recursion & Backtracking**

- Recursive Factorial, String Reversal, N-Queens Problem

#### **Heap Structures**

- Binary Heap, Binomial Queue, Fibonacci Heap, Leftist Heap, Skew Heap

#### **Geometric Algorithms**

- 2D/3D Transformations, Coordinate Systems

#### **Advanced Data Structures**

- Disjoint Sets (Union-Find)

</details>

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **Animations**: Framer Motion 12.23
- **Icons**: Lucide React
- **Build Tool**: Turbopack (Next.js)

## 📦 Installation & Setup

### Prerequisites

- **Node.js** 18.0 or higher
- **npm**, **yarn**, **pnpm**, or **bun**

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/Norbert-Brett/algorithm-visualizer.git
   cd algorithm-visualizer
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### shadcn/ui Configuration

This project uses shadcn/ui with the following configuration:

- **Style**: New York
- **Base Color**: Slate
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React

The UI components are pre-configured and ready to use. If you need to add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

## 🎮 Usage

### Navigation

- **Sidebar**: Browse algorithms by category
- **Search**: Use the search functionality within each algorithm
- **Controls**: Interactive buttons for operations (insert, delete, search, etc.)
- **Speed Control**: Adjust animation speed using the bottom control panel

### Algorithm Categories

1. **Basic Data Structures** - Stack, Queue
2. **Tree Data Structures** - BST, B-Tree, AVL, Red-Black, etc.
3. **Hash Tables** - Various collision resolution strategies
4. **Search Algorithms** - Linear, Binary, Graph traversal
5. **Sorting Algorithms** - Comparison and non-comparison sorts
6. **Graph Algorithms** - Traversal, shortest path, MST
7. **Dynamic Programming** - Classic DP problems
8. **Recursion & Backtracking** - Recursive problem solving
9. **Geometric Algorithms** - 2D/3D transformations
10. **Advanced Data Structures** - Union-Find, specialized structures

### Interactive Features

- **Real-time Visualization**: Watch algorithms execute step-by-step
- **Speed Control**: Adjust animation speed from 0.5x to 3x
- **Interactive Controls**: Add, remove, and search for elements
- **Educational Information**: Algorithm descriptions and complexity analysis
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🏗️ Project Structure

```
algorithm-visualizer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles with Tailwind + shadcn/ui
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components (Button, Card, Input, etc.)
│   │   ├── visualizations/    # Algorithm visualization components
│   │   │   ├── BSTVisualization.tsx
│   │   │   ├── BTreeVisualization.tsx
│   │   │   ├── LinearSearchVisualization.tsx
│   │   │   ├── BinarySearchVisualization.tsx
│   │   │   ├── DFSVisualization.tsx
│   │   │   ├── BFSVisualization.tsx
│   │   │   └── ...
│   │   ├── AlgorithmVisualizer.tsx  # Main visualizer component
│   │   ├── Sidebar.tsx             # Algorithm navigation
│   │   ├── VisualizationArea.tsx   # Visualization container
│   │   └── ControlPanel.tsx        # Speed and play controls
│   └── lib/                   # Utility functions
├── public/                    # Static assets
├── DEVELOPMENT_PLAN.md       # Detailed development roadmap
└── README.md                 # This file
```

## 🎨 Design System

### Color Coding

- **🔵 Blue**: Default/unvisited elements
- **🟡 Yellow/Orange**: Currently processing elements
- **🟢 Green**: Found/target elements
- **🔴 Red**: Visited/checked elements
- **🟣 Purple**: Stack/queue elements

### Animations

- **Smooth Transitions**: Framer Motion for fluid animations
- **Visual Feedback**: Clear state changes and progress indicators
- **Performance Optimized**: 60fps animations with proper optimization

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint for code quality

# Alternative package managers
yarn dev / pnpm dev / bun dev
yarn build / pnpm build / bun build
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Priority Areas (High Impact)

1. **Core Sorting Algorithms** - Quick Sort, Insertion Sort, Shell Sort
2. **Advanced Tree Structures** - AVL Tree, Red-Black Tree
3. **Graph Algorithms** - Dijkstra's, Prim's MST, Kruskal's MST
4. **Hash Table Implementations** - Different collision resolution strategies

### Development Guidelines

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/algorithm-name`
3. **Follow the existing patterns**: Check existing visualizations for structure
4. **Add your algorithm**: Create a new component in `src/components/visualizations/`
5. **Update the routing**: Add your algorithm to `VisualizationArea.tsx`
6. **Test thoroughly**: Ensure animations are smooth and educational
7. **Submit a pull request**: Include description and screenshots

### Code Standards

- **TypeScript**: Strict typing for all components
- **UI Components**: Use shadcn/ui components for consistency
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Proper ARIA labels and keyboard navigation (built into shadcn/ui)
- **Performance**: Optimized animations and efficient algorithms
- **Documentation**: Clear comments and prop interfaces

## 📚 Educational Value

This project serves as an excellent resource for:

- **Computer Science Students** - Visual learning of algorithms
- **Coding Interview Preparation** - Understanding algorithm behavior
- **Educators** - Teaching tool for algorithm concepts
- **Developers** - Reference implementation of classic algorithms

### Learning Features

- **Step-by-step Execution**: Watch algorithms execute in real-time
- **Complexity Analysis**: Time and space complexity information
- **Interactive Controls**: Experiment with different inputs
- **Visual Feedback**: Clear indication of algorithm progress
- **Educational Descriptions**: Algorithm explanations and use cases

## 🐛 Known Issues & Limitations

- **TypeScript Language Server**: Occasional cache issues with imports (restart TS server)
- **Mobile Performance**: Some complex visualizations may be slower on older devices
- **Browser Compatibility**: Optimized for modern browsers (Chrome, Firefox, Safari, Edge)

## 🔮 Future Enhancements

- **Algorithm Comparison**: Side-by-side algorithm comparisons
- **Custom Input**: User-defined data sets and test cases
- **Export Functionality**: Save visualizations as GIFs or videos
- **Code Display**: Show actual algorithm implementation alongside visualization
- **Performance Metrics**: Real-time performance analysis and statistics
- **Interactive Tutorials**: Guided learning paths for different skill levels

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **shadcn** - For the beautiful, accessible UI component system
- **Radix UI** - For the underlying accessible primitives
- **Framer Motion** - For smooth animations
- **Tailwind CSS** - For utility-first styling
- **Lucide** - For beautiful icons
- **Computer Science Community** - For algorithm knowledge and inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/algorithm-visualizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/algorithm-visualizer/discussions)
- **Documentation**: Check the [Development Plan](DEVELOPMENT_PLAN.md) for detailed roadmap

---

**Made with ❤️ for the Computer Science community**

_Star ⭐ this repository if you find it helpful!_
