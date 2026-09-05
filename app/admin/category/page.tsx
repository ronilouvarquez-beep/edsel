"use client";

import { useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  CheckCircle2Icon,
  Columns3Icon,
  FilterIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialCategories = [
  {
    id: 1,
    name: "Cakes",
    description: "Custom cakes and celebration desserts",
    items: 3,
    categoryTypes: ["Food"] as CategoryType[],
    status: "Active",
  },
  {
    id: 2,
    name: "Food trays",
    description: "Savory food packages for sharing",
    items: 2,
    categoryTypes: ["Food"] as CategoryType[],
    status: "Active",
  },
  {
    id: 3,
    name: "Decorations",
    description: "Venue styling and event setup",
    items: 3,
    categoryTypes: ["Decoration"] as CategoryType[],
    status: "Active",
  },
  {
    id: 4,
    name: "Catering Buffet",
    description: "Buffet packages for larger events",
    items: 3,
    categoryTypes: ["Food"] as CategoryType[],
    status: "Active",
  },
];

type CategoryType = "Food" | "Decoration";
type Category = Omit<(typeof initialCategories)[number], "categoryTypes"> & {
  categoryTypes?: CategoryType[];
  skirtColors?: string[];
};
type ColumnKey = "name" | "description" | "categoryType" | "status";
const columnLabels: Record<ColumnKey, string> = {
  name: "Category",
  description: "Description",
  categoryType: "Category type",
  status: "Status",
};

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<ColumnKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [visibleColumns, setVisibleColumns] = useState<
    Record<ColumnKey, boolean>
  >({ name: true, description: true, categoryType: true, status: true });
  const [showCreate, setShowCreate] = useState(false);
  const query = search.trim().toLowerCase();
  const filtered = categories.filter(
    (category) =>
      (!query ||
        `${category.name} ${category.description}`
          .toLowerCase()
          .includes(query)) &&
      (statusFilter === "All" || category.status === statusFilter),
  );
  const sorted = sortColumn
    ? [...filtered].sort((left, right) => {
        const leftValue = String(sortColumn === "categoryType" ? left.categoryTypes?.join(", ") ?? "" : left[sortColumn]);
        const rightValue = String(sortColumn === "categoryType" ? right.categoryTypes?.join(", ") ?? "" : right[sortColumn]);
        const result = leftValue.localeCompare(rightValue, undefined, {
          numeric: true,
        });
        return sortDirection === "asc" ? result : -result;
      })
    : filtered;
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  function sortBy(column: ColumnKey) {
    setSortDirection(
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc",
    );
    setSortColumn(column);
    setPage(1);
  }

  function addCategory(category: Omit<Category, "id">) {
    setCategories((current) => [
      ...current,
      { ...category, id: Math.max(...current.map((item) => item.id), 0) + 1 },
    ]);
    setShowCreate(false);
  }

  function refreshCategories() {
    setSearch("");
    setStatusFilter("All");
    setSortColumn(null);
    setPage(1);
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Category</h1>
            <p className="mt-2 text-muted-foreground">
              Organize menu items by category.
            </p>
          </div>
          <Button onPress={() => setShowCreate(true)}>
            <PlusIcon /> Add category
          </Button>
        </header>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <div className="relative min-w-0 max-w-sm flex-1">
                  <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search categories..."
                    aria-label="Search categories"
                    className="pl-9"
                  />
                </div>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="sm">
                    <FilterIcon />
                    Filter
                  </Button>
                  <DropdownMenu placement="bottom start">
                    <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      id="all"
                      onAction={() => {
                        setStatusFilter("All");
                        setPage(1);
                      }}
                    >
                      All{statusFilter === "All" ? "  ✓" : ""}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      id="active"
                      onAction={() => {
                        setStatusFilter("Active");
                        setPage(1);
                      }}
                    >
                      Active{statusFilter === "Active" ? "  ✓" : ""}
                    </DropdownMenuItem>
                  </DropdownMenu>
                </DropdownMenuTrigger>
                {statusFilter !== "All" && (
                  <Badge variant="secondary">{statusFilter}</Badge>
                )}
              </div>
              <div className="flex items-center justify-end gap-1 rounded-md border bg-card p-1">
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm">
                    <Columns3Icon />
                    Columns
                  </Button>
                  <DropdownMenu placement="bottom end">
                    <DropdownMenuLabel>Show columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(Object.keys(columnLabels) as ColumnKey[]).map(
                      (column) => (
                        <DropdownMenuItem
                          key={column}
                          id={column}
                          onAction={() =>
                            setVisibleColumns((current) => ({
                              ...current,
                              [column]: !current[column],
                            }))
                          }
                        >
                          {visibleColumns[column] ? "✓  " : "    "}
                          {columnLabels[column]}
                        </DropdownMenuItem>
                      ),
                    )}
                  </DropdownMenu>
                </DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Refresh categories"
                  onPress={refreshCategories}
                >
                  <RefreshCwIcon />
                </Button>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                    <tr>
                      {(Object.keys(columnLabels) as ColumnKey[])
                        .filter((column) => visibleColumns[column])
                        .map((column) => (
                          <th key={column} className="h-10 px-4 font-medium">
                            <button
                              type="button"
                              onClick={() => sortBy(column)}
                              className="inline-flex items-center gap-1 hover:text-foreground"
                            >
                              {columnLabels[column]}
                              {sortColumn === column ? (
                                sortDirection === "asc" ? (
                                  <ArrowUpIcon className="size-3.5" />
                                ) : (
                                  <ArrowDownIcon className="size-3.5" />
                                )
                              ) : (
                                <ArrowUpDownIcon className="size-3.5" />
                              )}
                            </button>
                          </th>
                        ))}
                      <th className="h-10 w-10 px-2">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        {visibleColumns.name && (
                          <td className="px-4 py-3 font-medium">
                            {category.name}
                          </td>
                        )}
                        {visibleColumns.description && (
                          <td className="px-4 py-3 text-muted-foreground">
                            {category.description}
                          </td>
                        )}
                        {visibleColumns.categoryType && (
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {category.categoryTypes?.length ? category.categoryTypes.map((type) => (
                                <Badge key={type} variant="secondary">{type}</Badge>
                              )) : <span className="text-muted-foreground">Not set</span>}
                            </div>
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className="gap-1.5 text-emerald-700"
                            >
                              <CheckCircle2Icon className="size-3.5" />
                              {category.status}
                            </Badge>
                          </td>
                        )}
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            className="flex size-8 items-center justify-center rounded-lg hover:bg-muted"
                            aria-label={`More actions for ${category.name}`}
                          >
                            <MoreHorizontalIcon className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paginated.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="h-24 p-3 text-center text-muted-foreground"
                        >
                          No categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {sorted.length === 0 ? 0 : (page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, sorted.length)} of {sorted.length}{" "}
                categories
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  Rows{" "}
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                    className="h-8 rounded-md border bg-background px-2"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </label>
                <span>
                  Page {page} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous page"
                  isDisabled={page <= 1}
                  onPress={() => setPage((current) => Math.max(1, current - 1))}
                >
                  ‹
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next page"
                  isDisabled={page >= pageCount}
                  onPress={() =>
                    setPage((current) => Math.min(pageCount, current + 1))
                  }
                >
                  ›
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {showCreate && (
        <CreateCategoryModal
          onClose={() => setShowCreate(false)}
          onCreate={addCategory}
        />
      )}
    </main>
  );
}

function CreateCategoryModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (category: Omit<Category, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [skirtColors, setSkirtColors] = useState<string[]>([]);
  const [colorToAdd, setColorToAdd] = useState("#000000");
  const [description, setDescription] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({
      name,
      categoryTypes: categoryTypes.length ? categoryTypes : undefined,
      skirtColors: skirtColors.length ? skirtColors : undefined,
      description,
      items: 0,
      status: "Active",
    });
  }

  function addColor() {
    if (!skirtColors.includes(colorToAdd))
      setSkirtColors((current) => [...current, colorToAdd]);
  }

  function toggleCategoryType(type: CategoryType) {
    setCategoryTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
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
        aria-labelledby="create-category-title"
        className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="create-category-title"
              className="text-2xl font-bold text-primary"
            >
              Add category
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Category management
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg hover:bg-muted"
            aria-label="Close create category form"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            Category name
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="For example, Desserts"
              required
            />
          </label>
          <fieldset className="grid gap-3 rounded-lg border p-3">
            <legend className="px-1 text-sm font-medium">Category type</legend>
            <p className="text-xs text-muted-foreground">
              Select all types that apply.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(["Food", "Decoration"] as CategoryType[]).map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${categoryTypes.length > 0 && !categoryTypes.includes(type) ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={categoryTypes.includes(type)}
                    onChange={() => toggleCategoryType(type)}
                    disabled={categoryTypes.length > 0 && !categoryTypes.includes(type)}
                    className="size-4 rounded-full accent-primary"
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="grid gap-3 rounded-lg border p-3">
            <legend className="px-1 text-sm font-medium">
              (optional) Skirt Color
            </legend>
            <p className="text-xs text-muted-foreground">
              Choose one or more colors for this category.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorToAdd}
                onChange={(event) => setColorToAdd(event.target.value)}
                className="size-9 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Choose a skirt color"
              />
              <span className="font-mono text-xs uppercase text-muted-foreground">
                {colorToAdd}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onPress={addColor}
              >
                <PlusIcon /> Add color
              </Button>
            </div>
            {skirtColors.length > 0 && (
              <div
                className="flex flex-wrap gap-2"
                aria-label="Selected skirt colors"
              >
                {skirtColors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
                  >
                    <span
                      className="size-4 rounded-full border"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <span className="font-mono uppercase">{color}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSkirtColors((current) =>
                          current.filter((item) => item !== color),
                        )
                      }
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${color}`}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </fieldset>
          <label className="grid gap-2 text-sm font-medium">
            Description
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe this category"
              required
            />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onPress={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <PlusIcon /> Create category
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
