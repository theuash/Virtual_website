export const learningVideos = [
  // ── VIDEO EDITING - DaVinci Resolve ───────────────────────────
  {
    skill: 'video_editing',
    software: 'davinci_resolve',
    tutorials: [
      {
        id: 'dr-basics',
        title: 'Introduction to DaVinci Resolve Full Course for Beginners',
        desc: 'Basic cutting & assembly Raw footage sorting & syncing Standard editing (cuts, transitions, audio sync)',
        duration: '~2 hr',
        level: 'Beginner',
        instructor: 'Casey Faris',
        youtubeId: 'qDHnCFMZ9HA',
      },
      {
        id: 'dr-advanced',
        title: 'DaVinci Resolve 19 Advanced Tutorial – Effects, Keyframes & Multi-Cam',
        desc: 'Advanced editing (effects, keyframes, multi-cam) Full production (graphics, sound design)',
        duration: '~1.5 hr',
        level: 'Advanced',
        instructor: 'Darren Mostyn',
        youtubeId: 'b2OYhIUSNpA',
      },
    ],
    playlists: [
      {
        id: 'pl-motion-graphics',
        title: 'Motion Graphics',
        description: 'Learn motion graphics and animation techniques in DaVinci Resolve',
        level: 'Intermediate',
        videos: [
          {
            youtubeId: '1efaAQEIDTg',
            title: 'Motion Graphics Basics',
            desc: 'Introduction to motion graphics in DaVinci Resolve',
            duration: '~30 min',
            level: 'Intermediate',
          },
          {
            youtubeId: 'JSV9uMEosOo',
            title: 'Advanced Motion Graphics',
            desc: 'Advanced motion graphics techniques and effects',
            duration: '~45 min',
            level: 'Intermediate',
          },
        ],
      },
    ],
    crash_courses: [
      {
        id: 'cc-basic-editing',
        title: 'Basic Video Editing in 6 Hours',
        description: 'Complete beginner course to master video editing in DaVinci Resolve',
        level: 'Beginner',
        videos: [
          {
            youtubeId: 'MCDVcQIA3UM',
            title: 'Getting Started with DaVinci Resolve',
            desc: 'Setup and basic interface overview',
            duration: '~2 hr',
            level: 'Beginner',
          },
          {
            youtubeId: 'SrJOE2pEp7A',
            title: 'Editing Fundamentals',
            desc: 'Learn the fundamentals of video editing',
            duration: '~2 hr',
            level: 'Beginner',
          },
        ],
      },
    ],
  },
];
