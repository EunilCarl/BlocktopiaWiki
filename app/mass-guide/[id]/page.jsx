// app/mass-guide/[id]/page.jsx
"use client";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef, use } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Panzoom from "@panzoom/panzoom";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

/* ------------------ Tree Builder ------------------ */
function buildTree(
  item,
  allItems,
  visited = new Set(),
  uniqueIdCounter = { value: 1000000 },
  path = ""
) {
  if (!item || !item.splicing || item.splicing === "N/A") {
    return {
      id: item?.id
        ? `${item.id}-${path}`
        : `generated-${uniqueIdCounter.value++}`,
      originalId: item?.id,
      name: item?.name || "",
      image: item?.image || "",
      ingredients: [],
    };
  }

  const nodeId = `${item.id}-${path}`;
  if (visited.has(nodeId)) {
    return {
      id: `duplicate-${nodeId}-${uniqueIdCounter.value++}`,
      originalId: item.id,
      name: item.name,
      image: item?.image || "",
      ingredients: [],
    };
  }
  visited.add(nodeId);

  const ingredients = item.splicing.split(" + ").map((s) => s.trim());
  const children = ingredients
    .map((ing, index) => {
      const ingItem = allItems.find((i) => i.name === ing);
      const childPath = `${path}-${index}`;
      return ingItem
        ? buildTree(ingItem, allItems, visited, uniqueIdCounter, childPath)
        : {
            id: `missing-${uniqueIdCounter.value++}`,
            originalId: null,
            name: ing,
            image: "",
            ingredients: [],
          };
    })
    .filter(Boolean);

  return {
    id: nodeId,
    originalId: item.id,
    name: item.name,
    image: item.image,
    ingredients: children,
  };
}

/* ------------------ Tree Node ------------------ */
function TreeNode({
  node,
  getImageUrl,
  completedItems,
  onToggleComplete,
  searchTerm,
}) {
  const isCompleted = completedItems.has(node.id);
  const canComplete =
    node.ingredients.length === 0 ||
    node.ingredients.every((child) => completedItems.has(child.id));

  const completionPercentage =
    node.ingredients.length === 0
      ? isCompleted
        ? 100
        : 0
      : (node.ingredients.filter((child) => completedItems.has(child.id))
          .length /
          node.ingredients.length) *
        100;

  const isHighlighted =
    searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className="flex flex-col items-center relative">
      {/* Node Card */}
      <Card
        onClick={() => {
          if (canComplete) {
            onToggleComplete(node.id);
          }
        }}
        className={`
          relative z-10 transition-all duration-300 hover:shadow-lg
          ${
            canComplete
              ? "cursor-pointer"
              : "cursor-default"
          }
          ${
            isCompleted
              ? "bg-green-50 border-green-300 shadow-green-100"
              : "bg-white hover:bg-gray-50"
          }
          ${
            canComplete && !isCompleted ? "border-blue-400 shadow-blue-100" : ""
          }
          min-w-32
          ${
            isHighlighted
              ? "ring-10 ring-yellow-400 shadow-lg shadow-yellow-400/50"
              : ""
          }
        `}
      >
        <CardContent className="p-4 flex flex-col items-center space-y-2">
          {/* Image */}
          {node.image && (
            <div className="relative">
              <Image
                src={getImageUrl(node.image)}
                alt={node.name}
                width={64}
                height={64}
                className={`rounded-lg object-cover transition-all duration-300 ${
                  isCompleted ? "opacity-90" : "opacity-100"
                }`}
              />
              {isCompleted && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </div>
          )}

          {/* Name */}
          <div
            className={`text-sm font-semibold text-center leading-tight ${
              isCompleted ? "text-green-800" : "text-gray-900"
            }`}
          >
            {node.name}
          </div>

          {/* Progress Bar */}
          {node.ingredients.length > 0 && (
            <div className="w-full space-y-1">
              <Progress value={completionPercentage} className="h-2" />
              <div className="text-xs text-gray-500 text-center">
                {Math.round(completionPercentage)}%
              </div>
            </div>
          )}

          {/* Checkbox */}
          <div
            className="flex items-center space-x-2 pt-1"
            onClick={(e) => {
              e.stopPropagation();
              if (canComplete) {
                onToggleComplete(node.id);
              }
            }}
          >
            <Checkbox
              checked={isCompleted}
              disabled={!canComplete}
              className={`
                ${
                  canComplete
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }
                ${
                  isCompleted
                    ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    : ""
                }
              `}
            />
            <span className="text-xs text-gray-600">
              {isCompleted
                ? "Completed"
                : canComplete
                ? "Mark Complete"
                : "Prerequisites Required"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Connectors */}
      {node.ingredients.length > 0 && (
        <div className="relative mt-6 flex justify-center w-full">
          <svg
            className="absolute -top-6 left-0 w-full pointer-events-none"
            style={{ height: "100px" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <marker
                id={`arrow-${node.id}`}
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M0,0 L0,6 L6,3 z"
                  fill={isCompleted ? "#10b981" : "#6b7280"}
                />
              </marker>
            </defs>

            {/* Vertical line */}
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="30"
              stroke={isCompleted ? "#10b981" : "#6b7280"}
              strokeWidth="3"
            />

            {/* Horizontal line */}
            {node.ingredients.length > 1 && (
              <line
                x1={`${50 - (node.ingredients.length - 1) * 25}%`}
                y1="30"
                x2={`${50 + (node.ingredients.length - 1) * 25}%`}
                y2="30"
                stroke={isCompleted ? "#10b981" : "#6b7280"}
                strokeWidth="3"
              />
            )}

            {/* Lines to children */}
            {node.ingredients.map((child, idx) => {
              const offsetFromCenter =
                (idx - (node.ingredients.length - 1) / 2) * 50;
              const childX = 50 + offsetFromCenter;
              const childCompleted = completedItems.has(child.id);

              return (
                <line
                  key={idx}
                  x1={`${childX}%`}
                  y1="30"
                  x2={`${childX}%`}
                  y2="90"
                  stroke={childCompleted ? "#10b981" : "#6b7280"}
                  strokeWidth="3"
                  markerEnd={`url(#arrow-${node.id})`}
                  strokeDasharray={childCompleted ? "none" : "5,5"}
                />
              );
            })}
          </svg>

          {/* Children */}
          <div className="flex justify-center gap-12 mt-16">
            {node.ingredients.map((child, idx) => (
              <TreeNode
                key={idx}
                node={child}
                getImageUrl={getImageUrl}
                completedItems={completedItems}
                onToggleComplete={onToggleComplete}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------ Main Page ------------------ */
export default function MassGuideDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const storageKey = `mass-guide-progress-${id}`;

  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const panzoomRef = useRef(null);

  const [completedItems, setCompletedItems] = useState(() => {
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return new Set(parsedData);
      }
    } catch (e) {
      console.error("Failed to load progress from localStorage", e);
    }
    return new Set();
  });

  /* ---------- Fetch Data ---------- */
  useEffect(() => {
    async function fetchData() {
      const { data: itemsData, error } = await supabase
        .from("items")
        .select("*");
      if (error) {
        console.error(error);
        return;
      }

      setItems(itemsData);
      const foundItem = itemsData.find((i) => String(i.id) === id);
      if (foundItem) {
        setItem(foundItem);
        const builtTree = buildTree(foundItem, itemsData);
        setTree(builtTree);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

/* ---------- Fixed Panzoom Logic ---------- */
  useEffect(() => {
    if (!contentRef.current || !containerRef.current || !tree) return;

    const containerEl = containerRef.current;
    const contentEl = contentRef.current;
    
    let isInitialLayout = true;

    containerEl.style.cursor = 'grab';

    const panzoom = Panzoom(contentEl, {
      maxScale: 5,
      minScale: 0.1,
      contain: 'outside',
      startScale: 1,
      step: 0.3,
      noBind: true,
    });
    
    panzoomRef.current = panzoom;
    
    // --- START MODIFIED LOGIC ---
    const centerAndFitTree = (animate = false) => {
        const containerWidth = containerEl.clientWidth;
        const containerHeight = containerEl.clientHeight;
        const contentWidth = contentEl.scrollWidth;
        const contentHeight = contentEl.scrollHeight;

        if (contentWidth === 0 || containerWidth === 0) {
            return;
        }

        // Calculate a scale that fits 85% of the container
        const scaleX = (containerWidth * 0.85) / contentWidth;
        const scaleY = (containerHeight * 0.85) / contentHeight;
        let newScale = Math.min(scaleX, scaleY, 1);
        newScale = Math.max(newScale, 0.1);

        const scaledWidth = contentWidth * newScale;
        const scaledHeight = contentHeight * newScale;
        
        // Calculate new X/Y to center the scaled content
        const newX = Math.max(0, (containerWidth - scaledWidth) / 2);
        const newY = Math.max(0, (containerHeight - scaledHeight) / 2);

        panzoom.zoom(newScale, { animate: animate });
        panzoom.pan(newX, newY, { animate: animate });
        panzoom.setOptions({ startScale: newScale });
    };

    // 1. Initial attempt to center immediately after Panzoom is created
    // Use setTimeout to ensure the DOM has painted the initial tree structure
    const initialCenterTimeout = setTimeout(() => {
        centerAndFitTree();
    }, 50); // Small delay to allow DOM to measure content
    
    // 2. The other initial centering logic is now part of the ResizeObserver below.

    // Event handlers (No changes needed here)
    // ... (handleWheel, handleDown, handleMove, handleUp) ...
    const handleWheel = (event) => {
        event.preventDefault();
        panzoom.zoomWithWheel(event);
    };
    
    const handleDown = (event) => {
        containerEl.style.cursor = 'grabbing';
        panzoom.handleDown(event);
    };
    
    const handleMove = (event) => {
        panzoom.handleMove(event);
    };
    
    const handleUp = (event) => {
        containerEl.style.cursor = 'grab';
        panzoom.handleUp(event);
    };

    containerEl.addEventListener("wheel", handleWheel, { passive: false });
    containerEl.addEventListener('pointerdown', handleDown);
    containerEl.addEventListener('pointermove', handleMove);
    containerEl.addEventListener('pointerup', handleUp);
    containerEl.addEventListener('pointercancel', handleUp);


    // 3. Optimized ResizeObserver Logic
    let debounceTimer = null;
    let lastContainerWidth = containerEl.clientWidth;
    let lastContainerHeight = containerEl.clientHeight;

    const observer = new ResizeObserver(() => {
        if (isInitialLayout) {
            isInitialLayout = false;
            lastContainerWidth = containerEl.clientWidth;
            lastContainerHeight = containerEl.clientHeight;
            return;
        }

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            if (!containerEl || !contentEl) return;

            const containerWidth = containerEl.clientWidth;
            const containerHeight = containerEl.clientHeight;
            
            if (containerWidth === lastContainerWidth && containerHeight === lastContainerHeight) {
                return;
            }
            
            lastContainerWidth = containerWidth;
            lastContainerHeight = containerHeight;

            centerAndFitTree(true); // Recenter with animation on resize

        }, 250);
    });

    observer.observe(containerEl);

    // 4. Manual layout observer (to handle tree content size change)
    // We observe the content element itself to react when the tree nodes load/change.
    const contentObserver = new ResizeObserver((entries) => {
        // Only run if the initial centering is done and tree has loaded
        if (entries[0].contentRect.width > 0 && isInitialLayout) {
            centerAndFitTree(false);
            isInitialLayout = false; // Mark initial layout as complete
            
            // Disconnect content observer after first successful center
            // to avoid continuous re-centering unless the container changes.
            contentObserver.disconnect();
        }
    });
    
    // Start observing the content element
    contentObserver.observe(contentEl);
    
    // --- END MODIFIED LOGIC ---

    return () => {
        clearTimeout(initialCenterTimeout); // Clear the initial center timeout
        if (debounceTimer) clearTimeout(debounceTimer);
        observer.disconnect();
        contentObserver.disconnect(); // Disconnect content observer
        
        if (containerEl) { 
            containerEl.removeEventListener("wheel", handleWheel);
            containerEl.removeEventListener('pointerdown', handleDown);
            containerEl.removeEventListener('pointermove', handleMove);
            containerEl.removeEventListener('pointerup', handleUp);
            containerEl.removeEventListener('pointercancel', handleUp);
            containerEl.style.cursor = 'default';
        }
        
        panzoom.destroy();
    };
  }, [tree]); // Dependency on 'tree' ensures it runs when the tree data is ready

  /* ---------- Save Progress ---------- */
  useEffect(() => {
    try {
      const dataToStore = JSON.stringify(Array.from(completedItems));
      localStorage.setItem(storageKey, dataToStore);
    } catch (e) {
      console.error("Failed to save progress to localStorage", e);
    }
  }, [completedItems, storageKey]);

  /* ---------- Controls ---------- */
  const handleZoomIn = () => {
    if (!panzoomRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;
    panzoomRef.current.zoomIn({ focal: { x: centerX, y: centerY } });
  };
  
  const handleZoomOut = () => {
    if (!panzoomRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;
    panzoomRef.current.zoomOut({ focal: { x: centerX, y: centerY } });
  };
  
  const handleResetZoom = () => panzoomRef.current?.reset();

  /* ---------- Completion ---------- */
  const handleToggleComplete = (itemId) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const handleResetProgress = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all your progress? This cannot be undone."
      )
    ) {
      setCompletedItems(new Set());
    }
  };

  const getOverallProgress = () => {
    if (!tree) return 0;
    const getAllNodes = (node) => [
      node,
      ...node.ingredients.flatMap(getAllNodes),
    ];
    const allNodes = getAllNodes(tree);
    if (allNodes.length === 0) return 0;
    return (
      (allNodes.filter((n) => completedItems.has(n.id)).length /
        allNodes.length) *
      100
    );
  };

  const getImageUrl = (path) => (path ? `/items/${path}` : "");

  if (loading) return <div className="p-6 flex justify-center">Loading...</div>;
  if (!item) return <p className="text-center mt-10">Item not found</p>;

  const overallProgress = getOverallProgress();

  return (
    <div className="p-6 bg-gradient-to-br min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          size="sm"
          onClick={handleResetProgress}
          className="cursor-pointer bg-red-600 hover:bg-red-800  text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Progress
        </Button>
      </div>
      
      {/* Header */}
      <div className="mb-10 text-center space-y-4">
        <h1 className="text-4xl font-bold">{item.name} Mass Guide</h1>
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>
      </div>

      {/* Tree Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-xl shadow-md transition-all duration-300",
          isFullscreen
            ? "fixed inset-0 z-50 h-screen w-screen rounded-none"
            : "h-[500px] sm:h-[600px] lg:h-[800px] lg:mx-12 xl:mx-24"
        )}
      >
        <DotPattern
          className={cn(
            "absolute inset-0 opacity-40 pointer-events-none",
            "[mask-image:radial-gradient(circle_at_center,white,transparent)]"
          )}
        />

        {/* Controls */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-6 right-3 sm:right-6 z-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pointer-events-none">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-48 md:w-64 pointer-events-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search items..."
              className="pl-9 bg-white/90 backdrop-blur-sm w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex gap-1.5 sm:gap-2 pointer-events-auto self-end sm:self-auto">
            <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 sm:h-9">
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom} className="h-8 sm:h-9">
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 sm:h-9">
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen((f) => !f)}
              className="h-8 sm:h-9"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Zoomable Content */}
        <div
          ref={contentRef}
          className="relative z-10 min-w-max px-100 sm:px-100 md:px-100 py-150 sm:py-100 select-none"
        >
          {tree && (
            <div className="flex justify-center">
              <TreeNode
                node={tree}
                getImageUrl={getImageUrl}
                completedItems={completedItems}
                onToggleComplete={handleToggleComplete}
                searchTerm={searchTerm}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}