// app/massguide/page.jsx
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MassGuidePage() {
  // Fetch items from Supabase
  const { data: items, error } = await supabase.from("items").select("*");

  if (error) {
    console.error(error);
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">❌ Failed to load items.</p>
      </div>
    );
  }

  const splicableItems = items.filter(
    (item) => item.splicing && item.splicing !== "N/A"
  );

  const getImageUrl = (path) =>
    path
      ? supabase.storage.from("items").getPublicUrl(path).data.publicUrl
      : "";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center tracking-tight">
        Mass Guide
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {splicableItems.map((item) => (
          <Link key={item.id} href={`/mass-guide/${item.id}`}>
            <Card className="group cursor-pointer transition hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-blue-900/40">
              <CardHeader className="flex flex-row items-center gap-3">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="w-10 h-10 rounded-md border dark:border-gray-700"
                />
                <CardTitle className="text-lg font-semibold group-hover:text-blue-500 transition-colors">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Recipe:
                </p>
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-800 dark:text-gray-200"
                >
                  {item.splicing}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
