// Playable first-person archery mini-game, embedded in an isolated iframe so
// its canvas loop, global key handlers, and fonts stay sandboxed from the app.
// Served as a static document from /public/archery-game.html.
export function HeroGame() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="overflow-hidden rounded-2xl border border-border bg-ink-900 shadow-lg ring-1 ring-black/5">
        <iframe
          src="/archery-game.html"
          title="Longbow Range — a playable archery mini-game"
          loading="lazy"
          className="block aspect-[4/3] w-full sm:aspect-[16/10]"
        />
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Click the range, then{" "}
        <span className="font-medium text-foreground">hold Space</span> to draw ·
        move to aim · release to loose
      </p>
    </div>
  );
}
