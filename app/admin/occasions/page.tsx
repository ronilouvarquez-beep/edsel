"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 10;
const occasionNames = ["Birthday", "Wedding", "Baptism"] as const;
type OccasionName = (typeof occasionNames)[number];
type DecorationStatus = "Available" | "Not available";
type Decoration = {
  id: number;
  name: string;
  description: string;
  price: string;
  images: string[];
  includes: string[];
  status: DecorationStatus;
  clothesColors?: string[];
};
type DecorationGroups = Record<OccasionName, Decoration[]>;

const initialDecorations: DecorationGroups = {
  Birthday: [
    {
      id: 1,
      name: "Birthday cake setup",
      description: "A cheerful backdrop and cake table for a memorable reveal.",
      price: "From ₱1,800",
      images: [
        "https://images.unsplash.com/photo-1530103862676-de8c9deaffa1?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1000&q=85",
      ],
      includes: [
        "Birthday backdrop",
        "Cake table styling",
        "Color theme accents",
      ],
      status: "Available",
    },
    {
      id: 4,
      name: "Kids party balloon wall",
      description: "A bright balloon wall and dessert table for children's parties.",
      price: "From ₱2,200",
      images: ["https://images.unsplash.com/photo-1530103862676-de8c9deaffa1?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Balloon wall", "Dessert table cloth", "Number stand"],
      status: "Available",
    },
    {
      id: 5,
      name: "Garden birthday picnic",
      description: "Outdoor picnic styling with blankets, florals, and a cake stand.",
      price: "From ₱3,400",
      images: ["https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Picnic setup", "Cake stand", "Floral accents"],
      status: "Available",
    },
    {
      id: 6,
      name: "Neon glow party",
      description: "A modern night setup with neon signs and photo corners.",
      price: "From ₱2,900",
      images: ["https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Neon sign", "Photo corner", "LED lights"],
      status: "Available",
    },
  ],
  Wedding: [
    {
      id: 2,
      name: "Wedding venue styling",
      description: "An elegant venue setup for ceremony and reception moments.",
      price: "From ₱12,000",
      images: ["/panorama.png", "/beach.png"],
      includes: [
        "Ceremony backdrop",
        "Floral aisle styling",
        "Reception table setup",
      ],
      status: "Available",
    },
    {
      id: 7,
      name: "Garden wedding aisle",
      description: "Floral aisle markers and a soft ceremony arch.",
      price: "From ₱9,800",
      images: ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Ceremony arch", "Aisle florals", "Chair accents"],
      status: "Available",
    },
    {
      id: 8,
      name: "Reception sweetheart table",
      description: "A styled sweetheart table with florals and lighting.",
      price: "From ₱6,500",
      images: ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Sweetheart table", "Centerpiece", "Fairy lights"],
      status: "Available",
    },
    {
      id: 9,
      name: "Coastal wedding setup",
      description: "Light, airy styling for a beach or garden reception.",
      price: "From ₱11,500",
      images: ["https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Driftwood accents", "White drapes", "Lanterns"],
      status: "Available",
    },
  ],
  Baptism: [
    {
      id: 3,
      name: "Baptism celebration setup",
      description:
        "A thoughtful, light decoration package for a family gathering.",
      price: "From ₱2,800",
      images: [
        "https://images.unsplash.com/photo-1519225421980-715cb0215AED?auto=format&fit=crop&w=1000&q=85",
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=85",
      ],
      includes: [
        "Simple backdrop",
        "Cake table accents",
        "White and blue styling",
      ],
      status: "Available",
    },
    {
      id: 10,
      name: "Ivory christening table",
      description: "Soft ivory linens and a gentle cake table for family photos.",
      price: "From ₱2,400",
      images: ["https://images.unsplash.com/photo-1519225421980-715cb0215AED?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Ivory linens", "Cake table", "Floral spray"],
      status: "Available",
    },
    {
      id: 11,
      name: "Garden baptism picnic",
      description: "A light outdoor merienda setup after the ceremony.",
      price: "From ₱3,100",
      images: ["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Picnic tables", "Umbrella styling", "Welcome sign"],
      status: "Available",
    },
    {
      id: 12,
      name: "Gold and white backdrop",
      description: "A formal gold-and-white photo backdrop for family portraits.",
      price: "From ₱2,650",
      images: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Photo backdrop", "Balloon garland", "Name sign"],
      status: "Available",
    },
    {
      id: 13,
      name: "Church reception styling",
      description: "Simple, respectful styling for a post-ceremony reception hall.",
      price: "From ₱3,800",
      images: ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85"],
      includes: ["Hall drapes", "Centerpieces", "Welcome table"],
      status: "Available",
    },
  ],
};

export default function OccasionsPage() {
  const [selectedOccasion] = useState<OccasionName>("Birthday");
  const [decorations, setDecorations] = useState(initialDecorations);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const currentDecorations = Object.entries(decorations)
    .flatMap(([occasion, items]) =>
      items.map((item) => ({ ...item, occasion })),
    )
    .filter((decoration) =>
      `${decoration.name} ${decoration.description} ${decoration.occasion}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  const visibleDecorations = currentDecorations.slice(0, visibleCount);
  const hasMore = visibleCount < currentDecorations.length;

  function addDecoration(
    category: OccasionName,
    decoration: Omit<Decoration, "id">,
  ) {
    const nextId =
      Math.max(
        ...Object.values(decorations)
          .flat()
          .map((item) => item.id),
        0,
      ) + 1;
    setDecorations((current) => ({
      ...current,
      [category]: [...current[category], { ...decoration, id: nextId }],
    }));
    setShowAdd(false);
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Event setup</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Occasions
            </h1>
            <p className="mt-2 text-muted-foreground">
              Add and manage decoration packages for every celebration.
            </p>
          </div>
          <Button onPress={() => setShowAdd(true)}>
            <PlusIcon /> Add decoration
          </Button>
        </header>
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Decoration packages
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Decoration menu
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-56">
                <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder="Search decorations"
                  className="h-8 pl-8 text-sm"
                  aria-label="Search decorations"
                />
              </div>
              <Badge variant="secondary">
                {currentDecorations.length} available
              </Badge>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleDecorations.map((decoration) => (
              <DecorationCard key={decoration.id} decoration={decoration} />
            ))}
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-background p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PlusIcon />
              </span>
              <span className="mt-3 font-medium">
                Add decoration to {selectedOccasion}
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                Create another setup option
              </span>
            </button>
          </div>
          {currentDecorations.length > PAGE_SIZE && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onPress={() =>
                  setVisibleCount((current) =>
                    hasMore ? current + PAGE_SIZE : PAGE_SIZE,
                  )
                }
              >
                {hasMore
                  ? `See more (${currentDecorations.length - visibleCount} left)`
                  : "Show less"}
              </Button>
            </div>
          )}
        </section>
      </div>
      {showAdd && (
        <AddDecorationModal
          occasion={selectedOccasion}
          onClose={() => setShowAdd(false)}
          onAdd={addDecoration}
        />
      )}
    </main>
  );
}

function DecorationCard({ decoration }: { decoration: Decoration }) {
  const [imageIndex, setImageIndex] = useState(0);
  return (
    <Card className="group overflow-hidden bg-background [transform-style:preserve-3d] transition-transform duration-300 hover:[transform:perspective(1000px)_rotateX(2deg)_rotateY(-2deg)]">
      <div
        className="relative h-48 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('${decoration.images[imageIndex]}')` }}
        role="img"
        aria-label={`${decoration.name}, image ${imageIndex + 1} of ${decoration.images.length}`}
      >
        <div className="absolute inset-0 bg-black/10" />
        <button
          type="button"
          onClick={() =>
            setImageIndex(
              (current) =>
                (current - 1 + decoration.images.length) %
                decoration.images.length,
            )
          }
          className="absolute top-1/2 left-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
          aria-label={`Previous ${decoration.name} image`}
        >
          <ArrowLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            setImageIndex((current) => (current + 1) % decoration.images.length)
          }
          className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
          aria-label={`Next ${decoration.name} image`}
        >
          <ArrowRightIcon className="size-4" />
        </button>
        <Badge className={`absolute top-3 left-3 ${decoration.status === "Available" ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}`}>
          <CheckCircle2Icon /> {decoration.status}
        </Badge>
        <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
          {imageIndex + 1}/{decoration.images.length}
        </span>
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{decoration.name}</CardTitle>
        <CardDescription>{decoration.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between border-b pb-3">
          <span className="text-lg font-semibold text-primary">
            {decoration.price}
          </span>
          <span className="text-xs text-muted-foreground">Decoration</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Included
          </p>
          <ul className="mt-2 grid gap-1 text-sm">
            {decoration.includes.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2Icon className="size-3.5 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Button variant="outline" className="w-full">
          Manage decoration
        </Button>
      </CardContent>
    </Card>
  );
}

function ColorPalette({
  label,
  description,
  color,
  colors,
  onColorChange,
  onAdd,
  onRemove,
  className = "",
}: {
  label: string;
  description: string;
  color: string;
  colors: string[];
  onColorChange: (color: string) => void;
  onAdd: () => void;
  onRemove: (color: string) => void;
  className?: string;
}) {
  return (
    <div className={`grid gap-3 ${className}`}>
      <div>
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(event) => onColorChange(event.target.value)}
          className="size-9 cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label={`Choose a ${label.toLowerCase()}`}
        />
        <span className="font-mono text-xs uppercase text-muted-foreground">{color}</span>
        <Button type="button" size="sm" variant="outline" onPress={onAdd}>
          <PlusIcon /> Add
        </Button>
      </div>
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label={`Selected ${label.toLowerCase()}s`}>
          {colors.map((selectedColor) => (
            <span key={selectedColor} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
              <span className="size-4 rounded-full border" style={{ backgroundColor: selectedColor }} aria-hidden="true" />
              <span className="font-mono uppercase">{selectedColor}</span>
              <button type="button" onClick={() => onRemove(selectedColor)} className="ml-1 text-muted-foreground hover:text-foreground" aria-label={`Remove ${selectedColor}`}>
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AddDecorationModal({
  occasion,
  onClose,
  onAdd,
}: {
  occasion: OccasionName;
  onClose: () => void;
  onAdd: (category: OccasionName, decoration: Omit<Decoration, "id">) => void;
}) {
  const [category, setCategory] = useState<OccasionName>(occasion);
  const [status, setStatus] = useState<DecorationStatus>("Available");
  const [clothesColors, setClothesColors] = useState<string[]>([]);
  const [colorToAdd, setColorToAdd] = useState("#000000");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [includedItems, setIncludedItems] = useState([""]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(
    () => () =>
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview)),
    [imagePreviews],
  );

  function addImages(files: File[]) {
    setImages((current) => [...current, ...files]);
    setImagePreviews((current) => [
      ...current,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAdd(category, {
      name,
      status,
      clothesColors: clothesColors.length ? clothesColors : undefined,
      description,
      price: `From ₱${price}`,
      images: images.length
        ? images.map((file) => URL.createObjectURL(file))
        : ["/panorama.png"],
      includes: includedItems.map((item) => item.trim()).filter(Boolean),
    });
  }

  function updateIncluded(index: number, value: string) {
    setIncludedItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function addClothesColor() {
    if (!clothesColors.includes(colorToAdd)) {
      setClothesColors((current) => [...current, colorToAdd]);
    }
  }


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-decoration-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-decoration-title"
              className="text-2xl font-bold text-primary"
            >
              Add decoration
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a decoration option for any occasion
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg hover:bg-muted"
            aria-label="Close add decoration form"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <form className="mt-6 grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Category
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as OccasionName)
                }
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {occasionNames.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as DecorationStatus)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option>Available</option>
                <option>Not available</option>
              </select>
            </label>
          </div>
          <fieldset className="rounded-xl border bg-muted/20 p-4">
            <div>
              <ColorPalette
                label="Clothes color"
                description="Colors for the clothing or styling."
                color={colorToAdd}
                colors={clothesColors}
                onColorChange={setColorToAdd}
                onAdd={addClothesColor}
                onRemove={(color) => setClothesColors((current) => current.filter((item) => item !== color))}
              />
            </div>
          </fieldset>
          <label className="grid gap-2 text-sm font-medium">
            Decoration name
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="For example, Garden backdrop"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Description
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the decoration setup"
              required
            />
          </label>
          <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
            <label className="text-sm font-medium">Upload images</label>
            <p className="text-xs text-muted-foreground">
              Use a panorama or 360° image for an immersive venue view.
            </p>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) =>
                addImages(Array.from(event.target.files ?? []))
              }
            />
            {images.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={`${images[index].name}-${images[index].lastModified}`}
                      className="overflow-hidden rounded-md border bg-muted"
                    >
                      <div
                        className="h-20 bg-cover bg-center"
                        style={{ backgroundImage: `url('${preview}')` }}
                        role="img"
                        aria-label={`Uploaded decoration image ${index + 1}`}
                      />
                      <p className="truncate px-2 py-1 text-[10px] text-muted-foreground">
                        {images[index].name}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {images.length} image{images.length === 1 ? "" : "s"}{" "}
                  selected. Choose more files above to add more images.
                </p>
              </>
            )}
          </div>
          <label className="grid gap-2 text-sm font-medium">
            Price
            <Input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="1800"
              required
            />
          </label>
          <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include items</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onPress={() => setIncludedItems((current) => [...current, ""])}
              >
                <PlusIcon /> Add item
              </Button>
            </div>
            {includedItems.map((item, index) => (
              <div key={`include-${index}`} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(event) =>
                    updateIncluded(index, event.target.value)
                  }
                  placeholder={`Included item ${index + 1}`}
                  required
                />
                {includedItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove included item ${index + 1}`}
                    onPress={() =>
                      setIncludedItems((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <XIcon />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onPress={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <PlusIcon /> Add decoration
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
