window.PAPER_DATA = {
  horizons: [100, 150],
  rolloutFrames: 64,
  rolloutCases: [
    {
      id: "rescue-03",
      filter: "rescue",
      label: "Rescue",
      seed: 42,
      title: "Rescue at decision step 3",
      caption: "At decision 3, HAP picked a move that pointed more directly toward the goal.",
      initial: { x: 0.16, y: 0.73 },
      goal: { x: 0.81, y: 0.28 },
      phase: 0.2,
      nativeCurve: 0.26,
      hadpCurve: 0.035,
      nativeDrift: 0.34,
      hadpDrift: 0.02,
      nativeAngle: -0.35,
      hadpAngle: 0.03,
      clips: ["./assets/videos/env_7.mp4"],
      outcomes: {
        100: { native: { success: false, distance: 0.38, score: 0.38 }, hadp: { success: true, distance: 0.24, score: 0.29 }, step: 3 },
        150: { native: { success: false, distance: 0.44, score: 0.44 }, hadp: { success: true, distance: 0.28, score: 0.33 }, step: 3 }
      }
    },
    {
      id: "rescue-07",
      filter: "rescue",
      label: "Rescue",
      seed: 42,
      title: "Rescue through the narrow side",
      caption: "At decision 5, HAP kept moving toward the goal instead of circling it.",
      initial: { x: 0.22, y: 0.25 },
      goal: { x: 0.79, y: 0.73 },
      phase: 1.4,
      nativeCurve: -0.23,
      hadpCurve: -0.025,
      nativeDrift: 0.29,
      hadpDrift: 0.018,
      nativeAngle: 0.3,
      hadpAngle: -0.02,
      clips: ["./assets/videos/env_10.mp4"],
      outcomes: {
        100: { native: { success: false, distance: 0.35, score: 0.35 }, hadp: { success: true, distance: 0.22, score: 0.27 }, step: 5 },
        150: { native: { success: false, distance: 0.39, score: 0.39 }, hadp: { success: true, distance: 0.25, score: 0.30 }, step: 5 }
      }
    },
    {
      id: "loss-04",
      filter: "loss",
      label: "Loss",
      seed: 42,
      title: "A directional over-correction",
      caption: "Native CEM succeeds here; HAP chooses a worse direction and misses.",
      initial: { x: 0.16, y: 0.56 },
      goal: { x: 0.78, y: 0.22 },
      phase: 2.4,
      nativeCurve: 0.025,
      hadpCurve: 0.24,
      nativeDrift: 0.018,
      hadpDrift: 0.33,
      nativeAngle: -0.04,
      hadpAngle: 0.3,
      clips: ["./assets/videos/env_20.mp4"],
      outcomes: {
        100: { native: { success: true, distance: 0.18, score: 0.18 }, hadp: { success: false, distance: 0.41, score: 0.47 }, step: 4 },
        150: { native: { success: true, distance: 0.21, score: 0.21 }, hadp: { success: false, distance: 0.46, score: 0.52 }, step: 4 }
      }
    },
    {
      id: "loss-08",
      filter: "loss",
      label: "Loss",
      seed: 42,
      title: "Close, but pointed away",
      caption: "HAP changes the choice at decision 2, but this route misses the final contact.",
      initial: { x: 0.26, y: 0.78 },
      goal: { x: 0.76, y: 0.34 },
      phase: 3.1,
      nativeCurve: -0.02,
      hadpCurve: -0.22,
      nativeDrift: 0.015,
      hadpDrift: 0.27,
      nativeAngle: 0.02,
      hadpAngle: -0.27,
      clips: ["./assets/videos/env_31.mp4"],
      outcomes: {
        100: { native: { success: true, distance: 0.16, score: 0.16 }, hadp: { success: false, distance: 0.37, score: 0.43 }, step: 2 },
        150: { native: { success: true, distance: 0.19, score: 0.19 }, hadp: { success: false, distance: 0.42, score: 0.49 }, step: 2 }
      }
    },
    {
      id: "both-succeed-02",
      filter: "both-succeed",
      label: "Both succeed",
      seed: 42,
      title: "Two valid routes",
      caption: "Both plans reach the goal; HAP chooses the one with better direction.",
      initial: { x: 0.19, y: 0.68 },
      goal: { x: 0.83, y: 0.37 },
      phase: 0.8,
      nativeCurve: 0.1,
      hadpCurve: 0.04,
      nativeDrift: 0.02,
      hadpDrift: 0.015,
      nativeAngle: -0.12,
      hadpAngle: -0.03,
      clips: ["./assets/videos/env_49.mp4"],
      outcomes: {
        100: { native: { success: true, distance: 0.17, score: 0.17 }, hadp: { success: true, distance: 0.14, score: 0.22 }, step: 3 },
        150: { native: { success: true, distance: 0.2, score: 0.20 }, hadp: { success: true, distance: 0.17, score: 0.24 }, step: 3 }
      }
    },
    {
      id: "both-succeed-06",
      filter: "both-succeed",
      label: "Both succeed",
      seed: 42,
      title: "Stable contact corridor",
      caption: "The choice changes, but both plans keep contact long enough to reach the goal.",
      initial: { x: 0.2, y: 0.28 },
      goal: { x: 0.82, y: 0.7 },
      phase: 1.9,
      nativeCurve: -0.08,
      hadpCurve: -0.035,
      nativeDrift: 0.015,
      hadpDrift: 0.01,
      nativeAngle: 0.12,
      hadpAngle: 0.03,
      clips: ["./assets/videos/env_58.mp4"],
      outcomes: {
        100: { native: { success: true, distance: 0.15, score: 0.15 }, hadp: { success: true, distance: 0.13, score: 0.19 }, step: 4 },
        150: { native: { success: true, distance: 0.18, score: 0.18 }, hadp: { success: true, distance: 0.15, score: 0.22 }, step: 4 }
      }
    },
    {
      id: "both-fail-01",
      filter: "both-fail",
      label: "Both fail",
      seed: 42,
      title: "Contact lost before the turn",
      caption: "Neither plan keeps contact long enough to reach the goal; changing the score is not enough.",
      initial: { x: 0.13, y: 0.77 },
      goal: { x: 0.86, y: 0.27 },
      phase: 2.8,
      nativeCurve: 0.31,
      hadpCurve: 0.16,
      nativeDrift: 0.38,
      hadpDrift: 0.3,
      nativeAngle: -0.45,
      hadpAngle: -0.2,
      clips: ["./assets/videos/env_80.mp4"],
      outcomes: {
        100: { native: { success: false, distance: 0.52, score: 0.52 }, hadp: { success: false, distance: 0.45, score: 0.51 }, step: 3 },
        150: { native: { success: false, distance: 0.57, score: 0.57 }, hadp: { success: false, distance: 0.49, score: 0.55 }, step: 3 }
      }
    },
    {
      id: "both-fail-09",
      filter: "both-fail",
      label: "Both fail",
      seed: 42,
      title: "Goal behind an unrecoverable push",
      caption: "Both plans enter a bad contact mode. This failure stays visible in the demo.",
      initial: { x: 0.29, y: 0.19 },
      goal: { x: 0.73, y: 0.8 },
      phase: 4.2,
      nativeCurve: -0.3,
      hadpCurve: -0.18,
      nativeDrift: 0.35,
      hadpDrift: 0.32,
      nativeAngle: 0.36,
      hadpAngle: 0.22,
      clips: ["./assets/videos/env_97.mp4"],
      outcomes: {
        100: { native: { success: false, distance: 0.48, score: 0.48 }, hadp: { success: false, distance: 0.46, score: 0.53 }, step: 6 },
        150: { native: { success: false, distance: 0.53, score: 0.53 }, hadp: { success: false, distance: 0.50, score: 0.57 }, step: 6 }
      }
    }
  ],

  microscopeCandidates: [
    { id: "C01", x: 0.50, y: 0.52, distance: 0.32, direction: 0.12, angle: -0.6 },
    { id: "C02", x: 0.61, y: 0.42, distance: 0.14, direction: 0.30, angle: -0.15 },
    { id: "C03", x: 0.58, y: 0.57, distance: 0.23, direction: 0.22, angle: 0.48 },
    { id: "C04", x: 0.68, y: 0.55, distance: 0.28, direction: 0.16, angle: 0.08 },
    { id: "C05", x: 0.53, y: 0.39, distance: 0.21, direction: 0.19, angle: -0.9 },
    { id: "C06", x: 0.72, y: 0.39, distance: 0.19, direction: 0.08, angle: -0.05 },
    { id: "C07", x: 0.66, y: 0.31, distance: 0.17, direction: 0.25, angle: -0.55 },
    { id: "C08", x: 0.78, y: 0.48, distance: 0.26, direction: 0.10, angle: 0.2 },
    { id: "C09", x: 0.82, y: 0.35, distance: 0.37, direction: 0.03, angle: -0.1 },
    { id: "C10", x: 0.44, y: 0.31, distance: 0.42, direction: 0.05, angle: -0.8 },
    { id: "C11", x: 0.62, y: 0.67, distance: 0.30, direction: 0.31, angle: 0.65 },
    { id: "C12", x: 0.75, y: 0.62, distance: 0.25, direction: 0.18, angle: 0.55 }
  ],

  trainingDynamics: [
    { epoch: 1, direct: { next: 0.030274, rollout: 0.989199, straightness: 0.267300, control: 16 }, residual: { next: 0.021983, rollout: 0.787329, straightness: 0.368425, control: 34 } },
    { epoch: 2, direct: { next: 0.017188, rollout: 0.721829, straightness: 0.416921, control: null }, residual: { next: 0.012417, rollout: 0.703882, straightness: 0.458154, control: null } },
    { epoch: 3, direct: { next: 0.012645, rollout: 0.712024, straightness: 0.441567, control: 76 }, residual: { next: 0.009347, rollout: 0.700894, straightness: 0.484193, control: 78 } },
    { epoch: 4, direct: { next: 0.008152, rollout: 0.644536, straightness: 0.461704, control: null }, residual: { next: 0.005847, rollout: 0.789445, straightness: 0.501675, control: null } },
    { epoch: 5, direct: { next: 0.006074, rollout: 0.619123, straightness: 0.472197, control: 84 }, residual: { next: 0.004586, rollout: 0.654840, straightness: 0.511158, control: 84 } },
    { epoch: 6, direct: { next: 0.004919, rollout: 0.593091, straightness: 0.482400, control: null }, residual: { next: 0.003924, rollout: 0.612191, straightness: 0.515799, control: null } },
    { epoch: 7, direct: { next: 0.005178, rollout: 0.648337, straightness: 0.490173, control: 88 }, residual: { next: 0.003320, rollout: 0.553165, straightness: 0.520840, control: 84 } },
    { epoch: 8, direct: { next: 0.004191, rollout: 0.548855, straightness: 0.495330, control: null }, residual: { next: 0.003005, rollout: 0.536373, straightness: 0.523825, control: null } },
    { epoch: 9, direct: { next: 0.004181, rollout: 0.543874, straightness: 0.499491, control: null }, residual: { next: 0.002803, rollout: 0.525373, straightness: 0.525749, control: null } },
    { epoch: 10, direct: { next: 0.004225, rollout: 0.481633, straightness: 0.508395, control: 84 }, residual: { next: 0.002837, rollout: 0.495551, straightness: 0.526086, control: 86 } }
  ],

  figureMetrics: {
    hadpMechanism: {
      directionalCostReduction: { 100: "−0.0075 (1.9%)", 150: "−0.0057 (1.3%)" },
      changedDecisions: { 100: "45.1%", 150: "36.8%", aggregate: "40.9%" }
    },
    standardControl: {
      pushT: { random: 2, lewm: 88, pldm: 78, dinoWm: 74, rldLdad: 94 },
      reacher: { random: 10, lewm: 86, pldm: 78, dinoWm: 79, rldLdad: 92 }
    },
    longHorizon: {
      lewm: { 100: 16, 150: 8 },
      lewmHadp: { 100: 18, 150: 13 },
      rld: { 100: 15, 150: 13 },
      rldHadp: { 100: 18, 150: 12 },
      rldLdadHadp: { 100: 19, 150: 16 }
    },
    rldActionAwareness: {
      rankingAccuracy: { rld: "84%", ldad: "93%" },
      margin: { rld: "0.1105", ldad: "0.1674" },
      sensitivity: { rld: "0.7831", ldad: "0.8082" },
      control: { rld: "92%", ldad: "94%" },
      rolloutAuc: { rld: "0.5364", ldad: "0.5302" }
    }
  },

  quantitative: {
    headline: {
      title: "RLT + HAP compared with RLT only",
      columns: ["H=100", "H=150", "Aggregate"],
      rows: [
        { label: "RLT only", values: ["13.3%", "14.0%", "13.7%"], kind: "base" },
        { label: "RLT + HADP", values: ["18.7%", "16.7%", "17.7%"], kind: "highlight" },
        { label: "Gain", values: ["+5.3 pp", "+2.7 pp", "+4.0 pp"], kind: "gain" }
      ],
      insight: "The aggregate 95% CI is [−2, +10] pp. The point estimate is encouraging, but the interval crosses zero.",
      foot: "3 evaluation seeds × 50 paired cases per horizon · locked λ=2 at H=100 and λ=1 at H=150"
    },
    transfer: {
      title: "RLT + ADR with and without HADP",
      columns: ["H=100", "H=150", "Aggregate"],
      rows: [
        { label: "RLD + ADR", values: ["15.3%", "13.3%", "14.3%"], kind: "base" },
        { label: "RLD + ADR + HAP", values: ["19.3%", "12.7%", "16.0%"], kind: "highlight" },
        { label: "Planner change", values: ["+4.0 pp", "−0.7 pp", "+1.7 pp"], kind: "gain" }
      ],
      insight: "The transfer is horizon-dependent: positive at H=100, negative at H=150. It is evidence of a planning effect, not a consistent stack.",
      foot: "3 evaluation seeds × 50 paired cases per horizon"
    }
  }
};
