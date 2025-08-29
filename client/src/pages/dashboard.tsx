import { TopBar } from "@/components/top-bar";
import { NowPlaying } from "@/components/now-playing";
import { VibeCapture } from "@/components/vibe-capture";
import { WeeklyRecap } from "@/components/weekly-recap";
import { VibeTimeline } from "@/components/vibe-timeline";

export default function Dashboard() {
  return (
    <>
      <TopBar title="Capture Your Vibe" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 pb-8">
        <NowPlaying />
        <VibeCapture />
        <WeeklyRecap />
        <VibeTimeline limit={5} showLoadMore={true} />
      </div>
    </>
  );
}
