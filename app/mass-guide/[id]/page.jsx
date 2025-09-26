// app/mass-guide/[id]/page.jsx
"use client";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef, use } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Panzoom from "@panzoom/panzoom";

/* ------------------ Tree Builder (unchanged) ------------------ */
function buildTree(item, allItems, visited = new Set(), uniqueIdCounter = { value: 1000000 }, path = "") {
  if (!item || !item.splicing || item.splicing === "N/A") {
    return {
      id: item?.id ? `${item.id}-${path}` : `generated-${uniqueIdCounter.value++}`,
      originalId: item?.id,
      name: item?.name || "",
      image: item?.image || "",
      ingredients: []
    };
  }

  const nodeId = `${item.id}-${path}`;
  if (visited.has(nodeId)) {
    return {
      id: `duplicate-${nodeId}-${uniqueIdCounter.value++}`,
      originalId: item.id,
      name: item.name,
      image: item?.image || "",
      ingredients: []
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
            ingredients: []
          };
    })
    .filter(Boolean);

  return {
    id: nodeId,
    originalId: item.id,
    name: item.name,
    image: item.image,
    ingredients: children
  };
}

/* ------------------ Tree Node (unchanged) ------------------ */
function TreeNode({ node, getImageUrl, completedItems, onToggleComplete }) {
  const isCompleted = completedItems.has(node.id);
  const canComplete =
    node.ingredients.length === 0 ||
    node.ingredients.every((child) => completedItems.has(child.id));

  const completionPercentage =
    node.ingredients.length === 0
      ? isCompleted
        ? 100
        : 0
      : (node.ingredients.filter((child) => completedItems.has(child.id)).length / node.ingredients.length) *
        100;

  return (
    <div className="flex flex-col items-center relative">
      {/* Node Card */}
      <Card
        className={`
          relative z-10 transition-all duration-300 hover:shadow-lg cursor-pointer
          ${isCompleted ? "bg-green-50 border-green-300 shadow-green-100" : "bg-white hover:bg-gray-50"}
          ${canComplete && !isCompleted ? "border-blue-400 shadow-blue-100" : ""}
          min-w-32
        `}
      >
        <CardContent className="p-4 flex flex-col items-center space-y-2">
          {/* Image */}
          {node.image && (
            <div className="relative">
              <img
                src={getImageUrl(node.image)}
                alt={node.name}
                className={`w-16 h-16 rounded-lg object-cover transition-all duration-300 ${
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
          <div className={`text-sm font-semibold text-center leading-tight ${isCompleted ? "text-green-800" : "text-gray-900"}`}>
            {node.name}
          </div>

          {/* Progress Bar */}
          {node.ingredients.length > 0 && (
            <div className="w-full space-y-1">
              <Progress value={completionPercentage} className="h-2" />
              <div className="text-xs text-gray-500 text-center">{Math.round(completionPercentage)}%</div>
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
                ${canComplete ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                ${isCompleted ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" : ""}
              `}
            />
            <span className="text-xs text-gray-600">
              {isCompleted ? "Completed" : canComplete ? "Mark Complete" : "Prerequisites Required"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Connectors */}
      {node.ingredients.length > 0 && (
        <div className="relative mt-6 flex justify-center w-full">
          <svg className="absolute -top-6 left-0 w-full pointer-events-none" style={{ height: "100px" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id={`arrow-${node.id}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill={isCompleted ? "#10b981" : "#6b7280"} />
              </marker>
            </defs>

            {/* Vertical line */}
            <line x1="50%" y1="0" x2="50%" y2="30" stroke={isCompleted ? "#10b981" : "#6b7280"} strokeWidth="3" />

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
              const offsetFromCenter = (idx - (node.ingredients.length - 1) / 2) * 50;
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
              <TreeNode key={idx} node={child} getImageUrl={getImageUrl} completedItems={completedItems} onToggleComplete={onToggleComplete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------ Main Page with Panzoom ------------------ */
export default function MassGuideDetail({ params }) {
  const { id } = use(params); // ✅ unwrap params
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [tree, setTree] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const panzoomRef = useRef(null);

  /* ---------- Fetch Data ---------- */
  useEffect(() => {
    async function fetchData() {
      const { data: itemsData, error } = await supabase.from("items").select("*");
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

  /* ---------- Initialize Panzoom ---------- */
  /* ---------- Initialize Panzoom ---------- */
useEffect(() => {
  if (!contentRef.current) return;

  const panzoom = Panzoom(contentRef.current, {
    maxScale: 5,
    minScale: 0.001, // DECREASED THIS VALUE (e.g., from 0.3 to 0.1)
    contain: false,
    startScale: 0.8
  });

  // enable wheel zoom on container
  containerRef.current?.addEventListener("wheel", panzoom.zoomWithWheel);

  panzoomRef.current = panzoom;

  return () => {
    containerRef.current?.removeEventListener("wheel", panzoom.zoomWithWheel);
    panzoom.destroy();
  };
}, [tree]);

  /* ---------- Controls ---------- */
  const handleZoomIn = () => panzoomRef.current?.zoomIn();
  const handleZoomOut = () => panzoomRef.current?.zoomOut();
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

  const getOverallProgress = () => {
    if (!tree) return 0;
    const getAllNodes = (node) => [node, ...node.ingredients.flatMap(getAllNodes)];
    const allNodes = getAllNodes(tree);
    return (allNodes.filter((n) => completedItems.has(n.id)).length / allNodes.length) * 100;
  };

  const getImageUrl = (path) => (path ? supabase.storage.from("items").getPublicUrl(path).data.publicUrl : "");

  if (loading) return <div className="p-6 flex justify-center">Loading...</div>;
  if (!item) return <p className="text-center mt-10">Item not found</p>;

  const overallProgress = getOverallProgress();

  return (
    <div className="p-6 bg-gradient-to-br min-h-screen">
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

      {/* Controls */}
      <div className="absolute top-4 right-8 z-20 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetZoom}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsFullscreen((f) => !f)}>
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Tree */}
      <div
        ref={containerRef}
        className={`overflow-hidden bg-white rounded-xl shadow-sm ${
          isFullscreen ? "fixed inset-0  h-screen w-screen rounded-none" : "lg:m-30 h-[800px] flex  justify-center"
        }`}
      >
        <div ref={contentRef} className="min-w-max px-20 py-12 ">
          {tree && (
            <div className="flex justify-center">
              <TreeNode node={tree} getImageUrl={getImageUrl} completedItems={completedItems} onToggleComplete={handleToggleComplete} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
