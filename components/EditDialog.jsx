import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { ScrollArea } from "@/ui/scroll-area";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import categories from "@/data/categories";
import { Checkbox } from "@/ui/checkbox"
import { toast } from "sonner";

const EditDialog = ({
  editingItem,
  setEditingItem,
  file,
  setFile,
  previewUrl,
  setPreviewUrl,
  getImageUrl,
}) => {
  const [typeValue, setTypeValue] = useState(editingItem?.type || "");
  const [typeOpen, setTypeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const createdObjectUrlRef = useRef(null);

  
  useEffect(() => {
    if (editingItem?.type) {
      // Find the matching category and set its label as default
      const matchedCategory = categories.find(
        (c) => c.value.toLowerCase() === editingItem.type.toLowerCase()
      );
      setTypeValue(matchedCategory ? matchedCategory.label : "");
    } else {
      setTypeValue("");
    }
  }, [editingItem]);

  useEffect(() => {
    if (!setFile || !setPreviewUrl) return; // avoid undefined errors
    if (createdObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(createdObjectUrlRef.current);
      } catch {}
      createdObjectUrlRef.current = null;
    }

    setFile(null);
    setPreviewUrl(editingItem?.image ? getImageUrl(editingItem.image) : null);
  }, [editingItem, getImageUrl, setFile, setPreviewUrl]);

  useEffect(() => {
    return () => {
      if (createdObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(createdObjectUrlRef.current);
        } catch {}
      }
    };
  }, []);

  const handleFileChange = (e) => {
    if (!setFile || !setPreviewUrl) return;
    const f = e.target.files?.[0];
    if (createdObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(createdObjectUrlRef.current);
      } catch {}
      createdObjectUrlRef.current = null;
    }

    if (!f) {
      setFile(null);
      setPreviewUrl(editingItem?.image ? getImageUrl(editingItem.image) : null);
      return;
    }

    setFile(f);
    const objUrl = URL.createObjectURL(f);
    createdObjectUrlRef.current = objUrl;
    setPreviewUrl(objUrl);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!editingItem) return;
  setSubmitting(true);

  try {
    const formData = new FormData(e.target);

       let newImagePath = editingItem?.image || null;
    if (file) {
      let baseName = file.name.replace(/\s+/g, "_");
      let extension = "";
      const dotIndex = baseName.lastIndexOf(".");
      if (dotIndex !== -1) {
        extension = baseName.substring(dotIndex);
        baseName = baseName.substring(0, dotIndex);
      }

      let finalName = baseName + extension;
      let counter = 1;
      let uploaded = false;
      let data, error;

      while (!uploaded) {
        ({ data, error } = await supabase.storage
          .from("items")
          .upload(`suggestions/${finalName}`, file, { upsert: false }));

        if (!error) {
          uploaded = true;
        } else if (error.message.includes("The resource already exists")) {
          counter++;
          finalName = `${baseName}(${counter})${extension}`;
        } else {
          throw error;
        }
      }

      if (data?.path) newImagePath = data.path;
    }


    const propsInput = formData.get("properties");
    const propertiesArr = propsInput
      ? propsInput.toString().split(",").map(p => p.trim()).filter(Boolean)
      : null;

    const payload = {
      item_id: editingItem.id,
      new_name: formData.get("name") || undefined,
      new_rarity: formData.get("rarity") ? Number(formData.get("rarity")) : undefined,
      new_type: typeValue || undefined,
      new_description: formData.get("description") || undefined,
      new_splicing: formData.get("splicing") || undefined,
      new_growtime: formData.get("growTime") || undefined,
      new_value: formData.get("value") || undefined,
      new_properties: propertiesArr && propertiesArr.length ? propertiesArr : undefined,
      new_image: newImagePath, // or newImagePath if you handle file upload
      new_punch: formData.get("punch") ? Number(formData.get("punch")) : undefined,
      new_punchpick: formData.get("punchpick") ? Number(formData.get("punchpick")) : undefined,
      new_istradeable: formData.get("istradeable") === "on" ? true : false,
    };

    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    const { error: insertError } = await supabase
      .from("suggestions")
      .insert([payload]);
    if (insertError) throw insertError;

    toast("Suggestion submitted", { 
      description: "Your suggestion will be reviewed soon.", 
      action: { label: "Got it"},
    });

   setTimeout(() => {
  setEditingItem(null);
  setFile(null);
  setPreviewUrl(null);
}, 100); 

  } catch (err) {
    console.error("submit error", err);
      toast.error(`Failed to submit suggestion: ${err.message || err}`);
  } finally {
    setSubmitting(false);
  }
};


  return (
    <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
      <DialogContent className="w-[90vw] max-w-full sm:max-w-2xl md:max-w-3xl h-[80vh] max-h-screen p-2 flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4 border-b">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Edit Suggestion
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 pb-4 sm:px-6 sm:pb-6 h-[400px]">
          <form
            onSubmit={handleSubmit }
            className="space-y-4 sm:space-y-6 pt-4"
          >
            {/* Responsive Grid - Stack on mobile, 2 columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingItem?.name || ""}
                  className="h-10"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <Label htmlFor="rarity" className="text-sm font-medium">
                  Rarity
                </Label>
                <Input
                  id="rarity"
                  name="rarity"
                  type="number"
                  defaultValue={editingItem?.rarity ?? ""}
                  className="h-10"
                />
              </div>

              {/* Category Dropdown - Improved mobile handling */}

              <div className="flex flex-col space-y-1">
                <Label className="text-sm font-medium">Type</Label>
                <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={typeOpen}
                      className="w-full justify-between"
                    >
                      {typeValue || "Select type"}{" "}
                      {/* default shows current type */}
                      <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0 z-50">
                    <Command>
                      <CommandInput
                        placeholder="Search type..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No type found.</CommandEmpty>
                        <CommandGroup>
                          {categories
                            .filter((cat) => cat.value !== "all")
                            .map((cat) => (
                              <CommandItem
                                key={cat.value}
                                value={cat.value}
                                onSelect={() => {
                                  setTypeValue(cat.label); // store label with casing
                                  setTypeOpen(false);
                                }}
                              >
                                {cat.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    typeValue === cat.label
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="value" className="text-sm font-medium">
                  Gem Value
                </Label>
                <Input
                  id="value"
                  name="value"
                  defaultValue={editingItem?.value || ""}
                  className="h-10"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <Label htmlFor="splicing" className="text-sm font-medium">
                  Splicing
                </Label>
                <Input
                  id="splicing"
                  name="splicing"
                  defaultValue={editingItem?.splicing || ""}
                  className="h-10"
                />
              </div>

               <div className="flex flex-col space-y-1">
    <Label htmlFor="punch" className="text-sm font-medium">
      Punches Needed
    </Label>
    <Input
      id="punch"
      name="punch"
      type="number"
      defaultValue={editingItem?.punch ?? ""}
      className="h-10"
    />
  </div>

  <div className="flex flex-col space-y-1">
    <Label htmlFor="punchpick" className="text-sm font-medium">
      Punches with Pickaxe
    </Label>
    <Input
      id="punchpick"
      name="punchpick"
      type="number"
      defaultValue={editingItem?.punchpick ?? ""}
      className="h-10"
    />
  </div>

<div className="flex flex-col space-y-1">
  <Label htmlFor="istradeable" className="text-sm font-medium">
    is Tradeable
  </Label>
  <Checkbox
    id="istradeable"
    defaultChecked={editingItem?.istradeable ?? false}
    className="h-5 w-5"
  />
</div>


              <div className="flex flex-col space-y-1">
                <Label htmlFor="growTime" className="text-sm font-medium">
                  Grow Time
                </Label>
                <Input
                  id="growTime"
                  name="growTime"
                  defaultValue={editingItem?.growTime || ""}
                  className="h-10"
                />
              </div>
            </div>

            {/* Full-width fields */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                placeholder="Type your message here."
                id="description"
                name="description"
                defaultValue={editingItem?.description || ""}
                className="h-20"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <Label htmlFor="properties" className="text-sm font-medium">
                Properties
                <span className="text-xs text-muted-foreground">
                  (comma separated)
                </span>
              </Label>
              <Input
                id="properties"
                name="properties"
                defaultValue={(editingItem?.properties || []).join(", ")}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="image" className="text-sm font-medium">
                  Image{" "}
                  <span className="text-xs text-muted-foreground">
                    Maximum of 5MB*
                  </span>
                </Label>
                <Input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;

                    const maxSizeMB = 5;
                    if (f.size / 1024 / 1024 > maxSizeMB) {
                     setTimeout(() => {
  toast.error(`File is too large. Maximum allowed is ${maxSizeMB} MB.`);
}, 0);
                      e.target.value = null; // reset input
                      setFile(null);
                      setPreviewUrl(
                        editingItem?.image
                          ? getImageUrl(editingItem.image)
                          : null
                      );
                      return;
                    }

                    handleFileChange(e); // call your existing function
                  }}
                  className="h-10"
                />
              </div>
            </div>

            {/* Preview section */}
            <div className="flex flex-col space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Preview
              </div>
              <div className="w-full max-w-xs h-40 bg-muted/10 rounded-lg flex items-center justify-center overflow-hidden border mx-auto sm:mx-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground px-2 text-center">
                    No image selected
                  </div>
                )}
              </div>
            </div>

            {/* Submit button - Fixed at bottom with proper spacing */}
            <div className="pt-4 mt-6 border-t flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-w-[120px] h-10"
              >
                {submitting ? "Submitting..." : "Submit Suggestion"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;