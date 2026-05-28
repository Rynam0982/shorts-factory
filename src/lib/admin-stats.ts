export interface VideoEstimates {
  standard30s: number;
  standard60s: number;
  premium30s: number;
  premium60s: number;
  cinema30s: number;
  cinema60s: number;
  bottleneck: "fal" | "elevenlabs" | "balanced";
}

export async function estimateRemainingVideos(
  currentFalBalanceUsd: number,
  currentElevenLabsBalanceUsd: number
): Promise<VideoEstimates> {
  const costs = {
    standard30s: { fal: 1.20, el: 0.05 },
    standard60s: { fal: 2.40, el: 0.09 },
    premium30s:  { fal: 2.52, el: 0.05 },
    premium60s:  { fal: 5.04, el: 0.09 },
    cinema30s:   { fal: 3.36, el: 0.10 },
    cinema60s:   { fal: 6.72, el: 0.17 },
  };

  const estimates = {
    standard30s: Math.floor(Math.min(currentFalBalanceUsd / costs.standard30s.fal, currentElevenLabsBalanceUsd / costs.standard30s.el)),
    standard60s: Math.floor(Math.min(currentFalBalanceUsd / costs.standard60s.fal, currentElevenLabsBalanceUsd / costs.standard60s.el)),
    premium30s:  Math.floor(Math.min(currentFalBalanceUsd / costs.premium30s.fal,  currentElevenLabsBalanceUsd / costs.premium30s.el)),
    premium60s:  Math.floor(Math.min(currentFalBalanceUsd / costs.premium60s.fal,  currentElevenLabsBalanceUsd / costs.premium60s.el)),
    cinema30s:   Math.floor(Math.min(currentFalBalanceUsd / costs.cinema30s.fal,   currentElevenLabsBalanceUsd / costs.cinema30s.el)),
    cinema60s:   Math.floor(Math.min(currentFalBalanceUsd / costs.cinema60s.fal,   currentElevenLabsBalanceUsd / costs.cinema60s.el)),
  };

  // Determine bottleneck for standard 30s
  const falVidStd = currentFalBalanceUsd / costs.standard30s.fal;
  const elVidStd  = currentElevenLabsBalanceUsd / costs.standard30s.el;
  const bottleneck: VideoEstimates["bottleneck"] =
    falVidStd / elVidStd < 0.5 ? "fal" :
    elVidStd / falVidStd < 0.5 ? "elevenlabs" :
    "balanced";

  return { ...estimates, bottleneck };
}
