import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/DashboardHeader';
import {
  BookOpen, Play, Clock, ExternalLink, ChevronRight,
  MessageSquare, User, Star, Monitor,
} from 'lucide-react';

// ── Skill label map ───────────────────────────────────────────────
const SKILL_LABELS = {
  video_editing:     'Video Editing',
  '3d_animation':    '3D Animation',
  cgi:               'CGI / VFX',
  script_writing:    'Script Writing',
  graphic_designing: 'Graphic Design',
};

// ── Software options per skill ────────────────────────────────────
const SKILL_SOFTWARE = {
  video_editing:     ['Adobe Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'CapCut'],
  '3d_animation':    ['Blender', 'Cinema 4D', 'Maya', '3ds Max'],
  cgi:               ['After Effects', 'Nuke', 'Fusion', 'Houdini'],
  script_writing:    ['Final Draft', 'Celtx', 'Arc Studio', 'Google Docs'],
  graphic_designing: ['Adobe Photoshop', 'Illustrator', 'Figma', 'Canva'],
};

// ── Tutorials per software ────────────────────────────────────────
const SOFTWARE_TUTORIALS = {
  'Adobe Premiere Pro': [
    {
      id: 'pp1',
      title: 'Premiere Pro Interface & Workflow',
      desc: 'Navigate the timeline, panels, and project structure.',
      duration: '12 min',
      level: 'Beginner',
      youtubeQuery: 'premiere pro beginner interface tutorial',
    },
    {
      id: 'pp2',
      title: 'Color Correction & Grading',
      desc: 'Use Lumetri Color for professional-grade color work.',
      duration: '18 min',
      level: 'Intermediate',
      youtubeQuery: 'premiere pro lumetri color grading tutorial',
    },
    {
      id: 'pp3',
      title: 'Multi-cam Editing',
      desc: 'Sync and cut between multiple camera angles efficiently.',
      duration: '15 min',
      level: 'Intermediate',
      youtubeQuery: 'premiere pro multicam editing tutorial',
    },
    {
      id: 'pp4',
      title: 'Export Settings for Delivery',
      desc: 'Correct codecs, bitrates, and formats for client delivery.',
      duration: '8 min',
      level: 'Beginner',
      youtubeQuery: 'premiere pro export settings tutorial',
    },
  ],
  'DaVinci Resolve': [
    {
      id: 'dr1',
      title: 'DaVinci Resolve Overview',
      desc: 'Cut, color, Fairlight, and Fusion — all in one tool.',
      duration: '14 min',
      level: 'Beginner',
      youtubeQuery: 'davinci resolve beginner overview tutorial',
    },
    {
      id: 'dr2',
      title: 'Node-Based Color Grading',
      desc: 'Build professional color grades using the node system.',
      duration: '20 min',
      level: 'Intermediate',
      youtubeQuery: 'davinci resolve node color grading tutorial',
    },
    {
      id: 'dr3',
      title: 'Fusion VFX Basics',
      desc: 'Compositing and motion graphics inside Resolve.',
      duration: '16 min',
      level: 'Intermediate',
      youtubeQuery: 'davinci resolve fusion basics tutorial',
    },
    {
      id: 'dr4',
      title: 'Audio Mixing in Fairlight',
      desc: 'Clean, level, and master audio for video delivery.',
      duration: '10 min',
      level: 'Beginner',
      youtubeQuery: 'davinci resolve fairlight audio tutorial',
    },
  ],
  'Final Cut Pro': [
    {
      id: 'fcp1',
      title: 'Final Cut Pro Magnetic Timeline',
      desc: 'Master the unique magnetic timeline workflow.',
      duration: '11 min',
      level: 'Beginner',
      youtubeQuery: 'final cut pro magnetic timeline tutorial',
    },
    {
      id: 'fcp2',
      title: 'Color Wheels & Curves',
      desc: 'Professional color correction in Final Cut.',
      duration: '14 min',
      level: 'Intermediate',
      youtubeQuery: 'final cut pro color correction tutorial',
    },
    {
      id: 'fcp3',
      title: 'Motion Graphics with Titles',
      desc: 'Animated titles and lower thirds in Final Cut.',
      duration: '12 min',
      level: 'Intermediate',
      youtubeQuery: 'final cut pro motion graphics titles tutorial',
    },
  ],
  'CapCut': [
    {
      id: 'cc1',
      title: 'CapCut for Professional Edits',
      desc: 'Use CapCut beyond social media — for client-ready cuts.',
      duration: '9 min',
      level: 'Beginner',
      youtubeQuery: 'capcut professional editing tutorial',
    },
    {
      id: 'cc2',
      title: 'Keyframe Animation in CapCut',
      desc: 'Animate position, scale, and opacity with keyframes.',
      duration: '11 min',
      level: 'Intermediate',
      youtubeQuery: 'capcut keyframe animation tutorial',
    },
    {
      id: 'cc3',
      title: 'CapCut Color Grading',
      desc: 'Apply LUTs and manual color correction in CapCut.',
      duration: '8 min',
      level: 'Beginner',
      youtubeQuery: 'capcut color grading tutorial',
    },
  ],
  'Blender': [
    {
      id: 'bl1',
      title: 'Blender Interface & Navigation',
      desc: 'Learn the viewport, outliner, and properties panels.',
      duration: '13 min',
      level: 'Beginner',
      youtubeQuery: 'blender beginner interface tutorial',
    },
    {
      id: 'bl2',
      title: 'Modelling Fundamentals',
      desc: 'Box modelling, loop cuts, and subdivision surfaces.',
      duration: '22 min',
      level: 'Beginner',
      youtubeQuery: 'blender modelling fundamentals tutorial',
    },
    {
      id: 'bl3',
      title: 'Rigging & Weight Painting',
      desc: 'Rig a character and paint weights for clean deformation.',
      duration: '25 min',
      level: 'Intermediate',
      youtubeQuery: 'blender rigging weight painting tutorial',
    },
    {
      id: 'bl4',
      title: 'Cycles Rendering & Lighting',
      desc: 'Set up a professional render with Cycles.',
      duration: '18 min',
      level: 'Intermediate',
      youtubeQuery: 'blender cycles rendering lighting tutorial',
    },
  ],
  'Cinema 4D': [
    {
      id: 'c4d1',
      title: 'Cinema 4D Basics',
      desc: 'Scene setup, objects, and the attribute manager.',
      duration: '12 min',
      level: 'Beginner',
      youtubeQuery: 'cinema 4d beginner basics tutorial',
    },
    {
      id: 'c4d2',
      title: 'MoGraph Effectors',
      desc: 'Use cloners and effectors for motion graphics.',
      duration: '17 min',
      level: 'Intermediate',
      youtubeQuery: 'cinema 4d mograph effectors tutorial',
    },
    {
      id: 'c4d3',
      title: 'Redshift Rendering',
      desc: 'GPU rendering with Redshift inside C4D.',
      duration: '20 min',
      level: 'Advanced',
      youtubeQuery: 'cinema 4d redshift rendering tutorial',
    },
  ],
  'Maya': [
    {
      id: 'ma1',
      title: 'Maya Interface & Basics',
      desc: 'Viewports, shelves, and the outliner.',
      duration: '14 min',
      level: 'Beginner',
      youtubeQuery: 'maya beginner interface tutorial',
    },
    {
      id: 'ma2',
      title: 'Character Animation Principles',
      desc: 'Blocking, spline, and polish in Maya.',
      duration: '28 min',
      level: 'Intermediate',
      youtubeQuery: 'maya character animation tutorial',
    },
    {
      id: 'ma3',
      title: 'nCloth & Dynamics',
      desc: 'Simulate cloth, hair, and rigid bodies.',
      duration: '20 min',
      level: 'Advanced',
      youtubeQuery: 'maya ncloth dynamics tutorial',
    },
  ],
  '3ds Max': [
    {
      id: '3m1',
      title: '3ds Max Fundamentals',
      desc: 'Scene management, modifiers, and the stack.',
      duration: '13 min',
      level: 'Beginner',
      youtubeQuery: '3ds max beginner fundamentals tutorial',
    },
    {
      id: '3m2',
      title: 'Architectural Visualization',
      desc: 'Model and render an interior scene.',
      duration: '30 min',
      level: 'Intermediate',
      youtubeQuery: '3ds max architectural visualization tutorial',
    },
    {
      id: '3m3',
      title: 'V-Ray Rendering',
      desc: 'Set up V-Ray materials, lights, and render settings.',
      duration: '22 min',
      level: 'Advanced',
      youtubeQuery: '3ds max vray rendering tutorial',
    },
  ],
  'After Effects': [
    {
      id: 'ae1',
      title: 'After Effects Interface',
      desc: 'Compositions, layers, and the timeline.',
      duration: '11 min',
      level: 'Beginner',
      youtubeQuery: 'after effects beginner interface tutorial',
    },
    {
      id: 'ae2',
      title: 'Keying & Rotoscoping',
      desc: 'Remove green screen and roto-paint subjects.',
      duration: '19 min',
      level: 'Intermediate',
      youtubeQuery: 'after effects keying rotoscoping tutorial',
    },
    {
      id: 'ae3',
      title: 'Motion Tracking',
      desc: 'Track footage and attach elements to moving objects.',
      duration: '16 min',
      level: 'Intermediate',
      youtubeQuery: 'after effects motion tracking tutorial',
    },
    {
      id: 'ae4',
      title: '3D Camera & Depth',
      desc: 'Work in 3D space with cameras and lights.',
      duration: '14 min',
      level: 'Intermediate',
      youtubeQuery: 'after effects 3d camera tutorial',
    },
  ],
  'Nuke': [
    {
      id: 'nk1',
      title: 'Nuke Node Graph Basics',
      desc: 'Understand the node-based compositing workflow.',
      duration: '15 min',
      level: 'Beginner',
      youtubeQuery: 'nuke node graph compositing tutorial',
    },
    {
      id: 'nk2',
      title: 'Keying with Primatte',
      desc: 'Professional green screen removal in Nuke.',
      duration: '18 min',
      level: 'Intermediate',
      youtubeQuery: 'nuke primatte keying tutorial',
    },
    {
      id: 'nk3',
      title: 'Roto & Paint',
      desc: 'Rotoscoping and paint fixes for VFX shots.',
      duration: '20 min',
      level: 'Intermediate',
      youtubeQuery: 'nuke roto paint tutorial',
    },
  ],
  'Fusion': [
    {
      id: 'fu1',
      title: 'Fusion Compositing Basics',
      desc: 'Nodes, tools, and the flow workspace.',
      duration: '12 min',
      level: 'Beginner',
      youtubeQuery: 'fusion compositing basics tutorial',
    },
    {
      id: 'fu2',
      title: 'Particle Systems',
      desc: 'Create fire, smoke, and particle effects.',
      duration: '17 min',
      level: 'Intermediate',
      youtubeQuery: 'fusion particle systems tutorial',
    },
  ],
  'Houdini': [
    {
      id: 'ho1',
      title: 'Houdini Procedural Workflow',
      desc: 'Understand SOPs, DOPs, and the network editor.',
      duration: '18 min',
      level: 'Beginner',
      youtubeQuery: 'houdini procedural workflow tutorial',
    },
    {
      id: 'ho2',
      title: 'Fluid & Pyro Simulations',
      desc: 'Simulate water, fire, and smoke.',
      duration: '30 min',
      level: 'Advanced',
      youtubeQuery: 'houdini fluid pyro simulation tutorial',
    },
    {
      id: 'ho3',
      title: 'Destruction & Fracture',
      desc: 'Break apart geometry with Voronoi fracture.',
      duration: '25 min',
      level: 'Advanced',
      youtubeQuery: 'houdini destruction fracture tutorial',
    },
  ],
  'Final Draft': [
    {
      id: 'fd1',
      title: 'Screenplay Formatting Essentials',
      desc: 'Industry-standard formatting rules for feature and TV scripts.',
      duration: '10 min',
      level: 'Beginner',
      youtubeQuery: 'final draft screenplay formatting tutorial',
    },
    {
      id: 'fd2',
      title: 'Scene Headings & Action Lines',
      desc: 'Write clear sluglines and action blocks that directors love.',
      duration: '12 min',
      level: 'Beginner',
      youtubeQuery: 'final draft scene headings action lines tutorial',
    },
    {
      id: 'fd3',
      title: 'Dialogue Formatting & Character Cues',
      desc: 'Format dialogue, parentheticals, and dual dialogue correctly.',
      duration: '11 min',
      level: 'Intermediate',
      youtubeQuery: 'final draft dialogue formatting tutorial',
    },
  ],
  'Celtx': [
    {
      id: 'cx1',
      title: 'Celtx Script Writing Workflow',
      desc: 'Set up a project and write your first script in Celtx.',
      duration: '9 min',
      level: 'Beginner',
      youtubeQuery: 'celtx script writing workflow tutorial',
    },
    {
      id: 'cx2',
      title: 'Collaboration & Sharing',
      desc: 'Invite collaborators and manage script revisions as a team.',
      duration: '8 min',
      level: 'Beginner',
      youtubeQuery: 'celtx collaboration sharing tutorial',
    },
    {
      id: 'cx3',
      title: 'Production Planning in Celtx',
      desc: 'Break down your script into scenes, cast, and schedule.',
      duration: '14 min',
      level: 'Intermediate',
      youtubeQuery: 'celtx production planning breakdown tutorial',
    },
  ],
  'Arc Studio': [
    {
      id: 'as1',
      title: 'Modern Screenwriting in Arc Studio',
      desc: 'Get started with Arc Studio\'s clean, distraction-free interface.',
      duration: '10 min',
      level: 'Beginner',
      youtubeQuery: 'arc studio screenwriting tutorial',
    },
    {
      id: 'as2',
      title: 'Beat Sheets & Story Structure',
      desc: 'Use Arc\'s beat sheet tools to map your story beats.',
      duration: '13 min',
      level: 'Intermediate',
      youtubeQuery: 'arc studio beat sheet story structure tutorial',
    },
    {
      id: 'as3',
      title: 'Outline Tools & Scene Cards',
      desc: 'Organise your script with scene cards and outline view.',
      duration: '11 min',
      level: 'Intermediate',
      youtubeQuery: 'arc studio outline tools scene cards tutorial',
    },
  ],
  'Google Docs': [
    {
      id: 'gd1',
      title: 'Script Templates in Google Docs',
      desc: 'Set up a screenplay template with correct margins and fonts.',
      duration: '8 min',
      level: 'Beginner',
      youtubeQuery: 'google docs screenplay script template tutorial',
    },
    {
      id: 'gd2',
      title: 'Formatting with Paragraph Styles',
      desc: 'Use heading styles to format scene headings, action, and dialogue.',
      duration: '10 min',
      level: 'Beginner',
      youtubeQuery: 'google docs paragraph styles formatting tutorial',
    },
    {
      id: 'gd3',
      title: 'Real-Time Collaboration',
      desc: 'Share, comment, and co-write scripts with your team live.',
      duration: '7 min',
      level: 'Beginner',
      youtubeQuery: 'google docs real time collaboration tutorial',
    },
  ],
  'Adobe Photoshop': [
    {
      id: 'ps1',
      title: 'Layers & Masks',
      desc: 'Understand the layer panel, blending modes, and layer masks.',
      duration: '14 min',
      level: 'Beginner',
      youtubeQuery: 'photoshop layers masks beginner tutorial',
    },
    {
      id: 'ps2',
      title: 'Retouching & Healing',
      desc: 'Use the healing brush, clone stamp, and content-aware fill.',
      duration: '16 min',
      level: 'Intermediate',
      youtubeQuery: 'photoshop retouching healing brush tutorial',
    },
    {
      id: 'ps3',
      title: 'Smart Objects & Non-Destructive Editing',
      desc: 'Work non-destructively with smart objects and smart filters.',
      duration: '12 min',
      level: 'Intermediate',
      youtubeQuery: 'photoshop smart objects non destructive editing tutorial',
    },
    {
      id: 'ps4',
      title: 'Export for Web & Print',
      desc: 'Export assets correctly for web, social media, and print.',
      duration: '9 min',
      level: 'Beginner',
      youtubeQuery: 'photoshop export for web print tutorial',
    },
  ],
  'Illustrator': [
    {
      id: 'ai1',
      title: 'Vector Basics & Shapes',
      desc: 'Understand paths, anchor points, and the shape builder tool.',
      duration: '12 min',
      level: 'Beginner',
      youtubeQuery: 'illustrator vector basics shapes tutorial',
    },
    {
      id: 'ai2',
      title: 'Mastering the Pen Tool',
      desc: 'Draw precise curves and complex paths with the pen tool.',
      duration: '15 min',
      level: 'Intermediate',
      youtubeQuery: 'illustrator pen tool mastery tutorial',
    },
    {
      id: 'ai3',
      title: 'Logo Design Workflow',
      desc: 'Design a professional logo from concept to final vector.',
      duration: '22 min',
      level: 'Intermediate',
      youtubeQuery: 'illustrator logo design workflow tutorial',
    },
    {
      id: 'ai4',
      title: 'Export Formats for Clients',
      desc: 'Export SVG, PDF, PNG, and EPS files correctly for any use case.',
      duration: '8 min',
      level: 'Beginner',
      youtubeQuery: 'illustrator export formats svg pdf tutorial',
    },
  ],
  'Figma': [
    {
      id: 'fg1',
      title: 'Components & Variants',
      desc: 'Build reusable components and manage variants in Figma.',
      duration: '16 min',
      level: 'Intermediate',
      youtubeQuery: 'figma components variants tutorial',
    },
    {
      id: 'fg2',
      title: 'Auto Layout',
      desc: 'Create responsive frames that adapt to content automatically.',
      duration: '14 min',
      level: 'Intermediate',
      youtubeQuery: 'figma auto layout tutorial',
    },
    {
      id: 'fg3',
      title: 'Prototyping & Interactions',
      desc: 'Link frames and add interactions to create clickable prototypes.',
      duration: '13 min',
      level: 'Beginner',
      youtubeQuery: 'figma prototyping interactions tutorial',
    },
    {
      id: 'fg4',
      title: 'Design Systems',
      desc: 'Build a scalable design system with tokens, styles, and libraries.',
      duration: '20 min',
      level: 'Advanced',
      youtubeQuery: 'figma design systems tutorial',
    },
  ],
  'Canva': [
    {
      id: 'cv1',
      title: 'Brand Kit Setup',
      desc: 'Upload your brand colours, fonts, and logos into Canva.',
      duration: '7 min',
      level: 'Beginner',
      youtubeQuery: 'canva brand kit setup tutorial',
    },
    {
      id: 'cv2',
      title: 'Template Customisation',
      desc: 'Adapt professional templates to match your client\'s brand.',
      duration: '10 min',
      level: 'Beginner',
      youtubeQuery: 'canva template customization tutorial',
    },
    {
      id: 'cv3',
      title: 'Export for Print & Digital',
      desc: 'Choose the right file format and resolution for every output.',
      duration: '8 min',
      level: 'Beginner',
      youtubeQuery: 'canva export print digital tutorial',
    },
  ],
};

// ── Level badge colours (CSS-variable-safe via inline style) ─────
const LEVEL_STYLES = {
  Beginner:     { background: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  Intermediate: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  Advanced:     { background: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
};

// ── Sub-components ────────────────────────────────────────────────

function TutorialCard({ tutorial }) {
  const levelStyle = LEVEL_STYLES[tutorial.level] || LEVEL_STYLES.Beginner;
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(tutorial.youtubeQuery)}`;

  return (
    <div
      className="flex flex-col justify-between p-5 rounded-xl border transition-all hover:scale-[1.01]"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
            {tutorial.title}
          </h3>
          <span
            className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={levelStyle}
          >
            {tutorial.level}
          </span>
        </div>
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
          {tutorial.desc}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span
          className="flex items-center gap-1.5 text-[11px] font-semibold"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Clock size={11} strokeWidth={1.5} />
          {tutorial.duration}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Play size={11} strokeWidth={2} />
          Watch on YouTube
          <ExternalLink size={10} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}

function SupervisorPanel() {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <Monitor size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Your Supervisor
        </h2>
      </div>

      {/* Profile */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shrink-0"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            AM
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Arjun Mehta
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              Momentum Supervisor
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={10}
                  strokeWidth={1.5}
                  fill={s <= 5 ? 'var(--accent)' : 'none'}
                  style={{ color: 'var(--accent)' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-lg"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="text-center">
            <div className="text-base font-black" style={{ color: 'var(--accent)' }}>142</div>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Reviews
            </div>
          </div>
          <div className="text-center">
            <div className="text-base font-black" style={{ color: 'var(--accent)' }}>98%</div>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Approval
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
          Arjun oversees quality and delivery across creative departments. Reach out if you need
          guidance on a task or feedback on your work.
        </p>

        {/* Message button */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <MessageSquare size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          Message Supervisor
        </button>
      </div>

      {/* Tips */}
      <div
        className="px-5 pb-5 space-y-2"
      >
        <div
          className="text-[9px] font-black uppercase tracking-widest mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Learning Tips
        </div>
        {[
          'Watch tutorials at 1.25× speed to save time.',
          'Practice each technique on a real client brief.',
          'Ask your supervisor to review your first deliverable.',
        ].map((tip, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronRight size={12} strokeWidth={2} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function FreelancerLearning() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Build the ordered list of skills from the user's profile
  const userSkills = [
    ...(user?.primarySkill ? [user.primarySkill] : []),
    ...(Array.isArray(user?.secondarySkills) ? user.secondarySkills : []),
  ].filter((s) => SKILL_LABELS[s]); // only known skills

  const [activeSkill, setActiveSkill]     = useState(userSkills[0] || null);
  const [activeSoftware, setActiveSoftware] = useState(
    userSkills[0] ? (SKILL_SOFTWARE[userSkills[0]]?.[0] ?? null) : null
  );

  // When the user switches skill tabs, reset software to the first option
  function handleSkillChange(skill) {
    setActiveSkill(skill);
    setActiveSoftware(SKILL_SOFTWARE[skill]?.[0] ?? null);
  }

  const tutorials = activeSoftware ? (SOFTWARE_TUTORIALS[activeSoftware] ?? []) : [];

  // ── No skills set ─────────────────────────────────────────────
  if (userSkills.length === 0) {
    return (
      <>
        <DashboardHeader title="Learning" />
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <BookOpen
            size={48}
            strokeWidth={1}
            className="mb-4"
            style={{ color: 'var(--text-secondary)', opacity: 0.4 }}
          />
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            No skills set yet
          </h2>
          <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Complete your profile to see personalised tutorials tailored to your skills.
          </p>
          <button
            onClick={() => navigate('/freelancer/settings')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <User size={14} strokeWidth={2} />
            Go to Settings
          </button>
        </div>
      </>
    );
  }

  // ── Main layout ───────────────────────────────────────────────
  return (
    <>
      <DashboardHeader title="Learning" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left / main content (2/3) ──────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Skill tabs */}
            <div
              className="flex items-center gap-2 flex-wrap"
              role="tablist"
              aria-label="Skill tabs"
            >
              {userSkills.map((skill) => {
                const isActive = skill === activeSkill;
                return (
                  <button
                    key={skill}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSkillChange(skill)}
                    className="px-4 py-2 rounded-full text-sm font-semibold border transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
                      borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {SKILL_LABELS[skill]}
                  </button>
                );
              })}
            </div>

            {/* Software picker */}
            {activeSkill && (
              <div>
                <div
                  className="text-[9px] font-black uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Choose Software
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {(SKILL_SOFTWARE[activeSkill] ?? []).map((sw) => {
                    const isActive = sw === activeSoftware;
                    return (
                      <button
                        key={sw}
                        onClick={() => setActiveSoftware(sw)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: isActive ? 'var(--bg-card)' : 'var(--bg-secondary)',
                          borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        }}
                      >
                        <Monitor size={13} strokeWidth={1.5} />
                        {sw}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tutorial grid */}
            {activeSoftware && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                  <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {activeSoftware} Tutorials
                  </h2>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                    style={{
                      color: 'var(--text-secondary)',
                      borderColor: 'var(--border)',
                      background: 'var(--bg-card)',
                    }}
                  >
                    {tutorials.length} lessons
                  </span>
                </div>

                {tutorials.length === 0 ? (
                  <div
                    className="py-12 text-center rounded-xl border"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                  >
                    <BookOpen
                      size={28}
                      strokeWidth={1}
                      className="mx-auto mb-3"
                      style={{ color: 'var(--text-secondary)', opacity: 0.4 }}
                    />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      No tutorials available for this software yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tutorials.map((tutorial) => (
                      <TutorialCard key={tutorial.id} tutorial={tutorial} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right sidebar (1/3) ────────────────────────────── */}
          <div className="w-full lg:w-80 shrink-0">
            <SupervisorPanel />
          </div>

        </div>
      </div>
    </>
  );
}
