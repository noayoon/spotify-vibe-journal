import { TopBar } from "@/components/top-bar";
import { NowPlaying } from "@/components/now-playing";
import { VibeCapture } from "@/components/vibe-capture";
import { WeeklyRecap } from "@/components/weekly-recap";
import { VibeTimeline } from "@/components/vibe-timeline";

export default function Dashboard() {
  return (
    <>
      <TopBar title="Vibe Journal" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8 pb-8">
        {/* Capture Vibe Section */}
        <section id="capture-vibe" className="space-y-6">
          <NowPlaying />
          <VibeCapture />
        </section>

        {/* Weekly Recap Section */}
        <section id="weekly-recap" className="space-y-6">
          <WeeklyRecap />
        </section>

        {/* History Section */}
        <section id="history" className="space-y-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Recent Vibes</h2>
          </div>
          <VibeTimeline limit={10} showLoadMore={true} />
        </section>
      </div>
    </>
  );
}
