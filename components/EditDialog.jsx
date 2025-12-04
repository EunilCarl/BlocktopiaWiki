import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { Checkbox } from "@/ui/checkbox";
import { toast } from "sonner";
import { upload } from "@imagekit/next";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";
import { Filter } from "bad-words";

// Helper function to create the initial form state from the item
const getInitialFormData = (item) => ({
  name: item?.name || "",
  rarity: item?.rarity ?? "",
  type: item?.type || "",
  description: item?.description || "",
  splicing: item?.splicing || "",
  growTime: item?.growTime || "", // Mapped from growTime
  value: item?.value || "",
  properties: (item?.properties || []).join(", "), // Stored as a string for the input
  punch: item?.punch ?? "",
  punchpick: item?.punchpick ?? "",
  istradeable: item?.istradeable || false,
});

// Helper to find the matching label for the type value
const getInitialTypeLabel = (item) => {
  if (!item?.type) return "";
  const matchedCategory = categories.find(
    (c) => c.value.toLowerCase() === item.type.toLowerCase()
  );
  return matchedCategory ? matchedCategory.label : "";
};

// Profanity filter setup
const filter = new Filter();
const normalize = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[@!1]/g, "i")
    .replace(/3/g, "e")
    .replace(/0/g, "o")
    .replace(/4/g, "a")
    .replace(/v/g, "u");
};
const containsProfanity = (text) => {
  const normalized = normalize(text);
  return (
    filter.isProfane(normalized) ||
    filter.list.some((word) => normalized.includes(word))
  );
};


const EditDialog = ({
  editingItem,
  setEditingItem,
  file,
  setFile,
  previewUrl,
  setPreviewUrl,
  getImageUrl,
}) => {
  // Form and submission state
  const [formData, setFormData] = useState(getInitialFormData(editingItem));
  const [typeValue, setTypeValue] = useState(getInitialTypeLabel(editingItem));
  const [typeOpen, setTypeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // State for new features
  const [isDirty, setIsDirty] = useState(false); // Tracks if form has changed
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Refs
  const createdObjectUrlRef = useRef(null);
  const captchaRef = useRef(null);

  // Effect to reset the form when the editingItem changes (dialog opens)
  useEffect(() => {
    if (editingItem) {
      // Reset all form states to match the new item
      setFormData(getInitialFormData(editingItem));
      setTypeValue(getInitialTypeLabel(editingItem));
      setPreviewUrl(editingItem?.image ? getImageUrl(editingItem.image) : null);
      setFile(null);
      
      // Reset validation states
      setIsDirty(false);
      setCaptchaVerified(false);
      setErrorMessage("");
      captchaRef.current?.reset(); // Reset the reCAPTCHA widget

      // Clean up any old blob URL
      if (createdObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(createdObjectUrlRef.current);
        } catch {}
        createdObjectUrlRef.current = null;
      }
    }
  }, [editingItem, getImageUrl, setFile, setPreviewUrl]);

  // Effect to clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (createdObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(createdObjectUrlRef.current);
        } catch {}
      }
    };
  }, []);

  // Universal change handler for most inputs
  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setIsDirty(true); // Mark form as changed
  }, []);

  // Handler for the category combobox
  const handleTypeChange = (category) => {
    setTypeValue(category.label); // Set visual label
    setFormData((prev) => ({
      ...prev,
      type: category.label, // Set actual form data value
    }));
    setIsDirty(true); // Mark form as changed
    setTypeOpen(false);
  };

  // Handler for file input
  const handleFileChange = (e) => {
    if (!setFile || !setPreviewUrl) return;
    const f = e.target.files?.[0];

    // Clean up previous blob URL
    if (createdObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(createdObjectUrlRef.current);
      } catch {}
      createdObjectUrlRef.current = null;
    }

    // Reset to original image if no file is selected
    if (!f) {
      setFile(null);
      setPreviewUrl(editingItem?.image ? getImageUrl(editingItem.image) : null);
      // Note: We don't set isDirty(false) here, as other fields might be dirty.
      // Resetting a file *is* a change if a new file was previously staged.
      setIsDirty(true); 
      return;
    }

    setFile(f);
    const objUrl = URL.createObjectURL(f);
    createdObjectUrlRef.current = objUrl;
    setPreviewUrl(objUrl);
    setIsDirty(true); // Mark form as changed
  };

  // Handler for reCAPTCHA
  const onCaptchaChange = (value) => {
    setCaptchaVerified(!!value); // true if value is not null, false otherwise
    if (value) {
      setErrorMessage(""); // Clear captcha error if it was set
    }
  };

  // Main submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    // --- Validation ---
    setErrorMessage(""); // Reset error
    if (!isDirty && !file) {
      setErrorMessage("You haven't made any changes.");
      return;
    }
    if (!captchaVerified) {
      setErrorMessage("Please verify you are not a robot.");
      return;
    }
    
    // Check profanity
    const textFields = [formData.name, formData.description, formData.splicing, formData.properties];
    if (textFields.some(containsProfanity)) {
      setErrorMessage("Your suggestion contains inappropriate language and cannot be submitted.");
      return;
    }
    // --- End Validation ---
    
    setSubmitting(true);
    let newImageUrl = editingItem?.image || null;

    try {
      // --- 1. Image Upload (if new file) ---
      if (file) {
        const res = await fetch("/api/upload-auth");
        if (!res.ok) throw new Error("Failed to get ImageKit auth params");
        const { signature, expire, token, publicKey } = await res.json();

        const uploadRes = await upload({
          file,
          fileName: file.name,
          token,
          expire,
          signature,
          publicKey,
          folder: "/items/suggestions",
        });
        newImageUrl = uploadRes.url; // Get new full ImageKit URL
      }

      // --- 2. Build Payload ---
      const propertiesArr = formData.properties
        ? formData.properties.split(",").map((p) => p.trim()).filter(Boolean)
        : null;

      // Build payload, sending 'undefined' for any field that hasn't changed
      // This ensures we only update what's necessary.
      const payload = {
        item_id: editingItem.id,
        new_name: formData.name !== editingItem.name ? formData.name : undefined,
        new_rarity: formData.rarity !== (editingItem.rarity ?? "") ? Number(formData.rarity) : undefined,
        new_type: formData.type !== editingItem.type ? formData.type : undefined,
        new_description: formData.description !== editingItem.description ? formData.description : undefined,
        new_splicing: formData.splicing !== editingItem.splicing ? formData.splicing : undefined,
        new_growtime: formData.growTime !== editingItem.growTime ? formData.growTime : undefined,
        new_value: formData.value !== editingItem.value ? formData.value : undefined,
        new_properties: formData.properties !== (editingItem.properties || []).join(", ") ? propertiesArr : undefined,
        new_image: newImageUrl !== editingItem.image ? newImageUrl : undefined,
        new_punch: formData.punch !== (editingItem.punch ?? "") ? Number(formData.punch) : undefined,
        new_punchpick: formData.punchpick !== (editingItem.punchpick ?? "") ? Number(formData.punchpick) : undefined,
        new_istradeable: formData.istradeable !== editingItem.istradeable ? formData.istradeable : undefined,
      };

      // Remove keys that are undefined (no change)
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      // Check if any actual changes are left to submit
      if (Object.keys(payload).length <= 1) { // 1 because item_id is always present
        setErrorMessage("You haven't made any changes.");
        setSubmitting(false);
        return;
      }

      // --- 3. Submit to Supabase ---
      const { error: insertError } = await supabase
        .from("suggestions")
        .insert([payload]);
      if (insertError) throw insertError;

      toast("Suggestion submitted", {
        description: "Your suggestion will be reviewed soon.",
        action: { label: "Got it" },
      });

      // --- 4. Close Dialog (Success) ---
      setTimeout(() => {
        setEditingItem(null);
        // States will reset automatically when dialog re-opens
      }, 100);

    } catch (err) {
      console.error("submit error", err);
      toast.error(`Failed to submit suggestion: ${err.message || err}`);
      setErrorMessage(`Error: ${err.message || "Please try again."}`);
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pt-4">
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Name */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="h-10"
                />
              </div>

              {/* Rarity */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="rarity" className="text-sm font-medium">Rarity</Label>
                <Input
                  id="rarity"
                  name="rarity"
                  type="number"
                  value={formData.rarity}
                  onChange={handleFormChange}
                  className="h-10"
                />
              </div>

              {/* Type Combobox */}
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
                      {typeValue || "Select type"}
                      <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-50">
                    <Command>
                      <CommandInput placeholder="Search type..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No type found.</CommandEmpty>
                        <CommandGroup>
                          {categories
                            .filter((cat) => cat.value !== "all")
                            .map((cat) => (
                              <CommandItem
                                key={cat.value}
                                value={cat.value}
                                onSelect={() => handleTypeChange(cat)}
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

              {/* Gem Value */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="value" className="text-sm font-medium">Gem Value</Label>
                <Input
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleFormChange}
                  className="h-10"
                />
              </div>

              {/* Splicing */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="splicing" className="text-sm font-medium">Splicing</Label>
                <Input
                  id="splicing"
                  name="splicing"
                  value={formData.splicing}
                  onChange={handleFormChange}
                  className="h-10"
                />
              </div>

              {/* Punches Needed */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="punch" className="text-sm font-medium">Punches Needed</Label>
                <Input
                  id="punch"
                  name="punch"
                  type="number"
                  value={formData.punch}
                  onChange={handleFormChange}
                  className="h-10"
                />
              </div>

              {/* Punches with Pickaxe */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="punchpick" className="text-sm font-medium">Punches with Pickaxe</Label>
                <Input
                  id="punchpick"
                  name="punchpick"
                  type="number"
                  value={formData.punchpick}
                  onChange={handleFormChange}
                  className="h-10"
                />
              </div>

              {/* isTradeable */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="istradeable" className="text-sm font-medium">is Tradeable</Label>
                <Checkbox
                  id="istradeable"
                  name="istradeable"
                  checked={formData.istradeable}
                  onCheckedChange={(checked) => handleFormChange({ target: { name: 'istradeable', type: 'checkbox', checked } })}
                  className="h-5 w-5"
                />
              </div>

              {/* Grow Time */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="growTime" className="text-sm font-medium">Grow Time</Label>
                <Input
                  id="growTime"
                  name="growTime"
                  value={formData.growTime}
                  onChange={handleFormChange}
                  className="h-10"
                />
              </div>
            </div>
            {/* End Grid */}

            {/* Full-width fields */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                placeholder="Type your message here."
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="h-20"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <Label htmlFor="properties" className="text-sm font-medium">
                Properties <span className="text-xs text-muted-foreground">(comma separated)</span>
              </Label>
              <Input
                id="properties"
                name="properties"
                value={formData.properties}
                onChange={handleFormChange}
                className="h-10"
              />
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="image" className="text-sm font-medium">
                  Image <span className="text-xs text-muted-foreground">Maximum of 5MB*</span>
                </Label>
                <Input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => {
                    // File size validation
                    const f = e.target.files?.[0];
                    if (!f) {
                      handleFileChange(e); // Allow deselecting a file
                      return;
                    }
                    const maxSizeMB = 5;
                    if (f.size / 1024 / 1024 > maxSizeMB) {
                      toast.error(`File is too large. Max is ${maxSizeMB} MB.`);
                      e.target.value = null; // reset input
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
              <div className="text-sm font-medium text-muted-foreground">Preview</div>
              <div className="w-full max-w-xs h-40 bg-muted/10 rounded-lg flex items-center justify-center overflow-hidden border mx-auto sm:mx-0">
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={previewUrl}
                      alt="preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground px-2 text-center">
                    No image selected
                  </div>
                )}
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="flex flex-col space-y-2 items-center sm:items-start">
              <ReCAPTCHA
                ref={captchaRef}
                sitekey="6LcSysMrAAAAAHryuNdoVO42_hHMrxx5UUmsWO0b"
                onChange={onCaptchaChange}
              />
              {errorMessage && (
                <p className="text-sm font-medium text-red-500">{errorMessage}</p>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-4 mt-6 border-t flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !isDirty || !captchaVerified}
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