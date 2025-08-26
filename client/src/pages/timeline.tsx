import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { VibeTimeline } from "@/components/vibe-timeline";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function Timeline() {
  const [filter, setFilter] = useState<"all" | "emoji" | "artist">("all");
  const [filterValue, setFilterValue] = useState("");

  return (
    <>
      <TopBar title="Your Vibe Timeline" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
              <SelectTrigger className="w-48 bg-dark-surface border-dark-elevated">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent className="bg-dark-surface border-dark-elevated">
                <SelectItem value="all" className="text-white hover:bg-dark-elevated focus:bg-dark-elevated">All Vibes</SelectItem>
                <SelectItem value="emoji" className="text-white hover:bg-dark-elevated focus:bg-dark-elevated">By Emoji</SelectItem>
                <SelectItem value="artist" className="text-white hover:bg-dark-elevated focus:bg-dark-elevated">By Artist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <VibeTimeline filter={filter} filterValue={filterValue} />
      </div>
    </>
  );
}
