import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import {
  BookOpen, Play, Clock, ExternalLink, ChevronRight,
  MessageSquare, User, Star, Monitor, CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import VideoPlayerModal from '../../components/VideoPlayerModal';

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

function TutorialCard({ tutorial, progress, onWatch }) {
  const levelStyle = LEVEL_STYLES[tutorial.level] || LEVEL_STYLES.Beginner;
  const isCompleted = progress?.completed ?? false;
  const pct = progress?.durationSeconds > 0
    ? Math.min(100, Math.round((progress.watchedSeconds / progress.durationSeconds) * 100))
    : 0;

  return (
    <div
      className="flex flex-col justify-between p-5 rounded-xl border transition-all"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: isCompleted ? 'var(--accent)' : 'var(--border)',
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
            {tutorial.title}
          </h3>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={levelStyle}>
              {tutorial.level}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                <CheckCircle2 size={9} strokeWidth={2.5} /> Done
              </span>
            )}
          </div>
        </div>
        <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
          {tutorial.desc}
        </p>

        {/* Progress bar — only show if started */}
        {pct > 0 && (
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>Progress</span>
              <span className="text-[9px] font-bold" style={{ color: 'var(--accent)' }}>{pct}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: 'var(--accent)' }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
          <Clock size={11} strokeWidth={1.5} />
          {tutorial.duration}
        </span>
        <button
          onClick={() => onWatch(tutorial)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: isCompleted ? 'var(--bg-card)' : 'var(--accent)', color: isCompleted ? 'var(--accent)' : '#fff',
            border: isCompleted ? '1px solid var(--accent)' : 'none' }}
        >
          <Play size={11} strokeWidth={2} />
          {isCompleted ? 'Rewatch' : pct > 0 ? 'Continue' : 'Watch'}
        </button>
      </div>
    </div>
  );
}

function SupervisorPanel() {
  const [supervisor, setSupervisor]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [messaging, setMessaging]     = useState(false); // button loading state
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/freelancer/supervisor')
      .then(res => setSupervisor(res.data?.data ?? null))
      .catch(() => setSupervisor(null))
      .finally(() => setLoading(false));
  }, []);

  const handleMessageSupervisor = async () => {
    if (!supervisor?._id) return;
    setMessaging(true);
    try {
      // Create or find existing DM conversation with this supervisor
      const res = await api.post('/messaging/conversations', {
        type:    'dm',
        members: [supervisor._id],
        name:    supervisor.fullName,
      });
      const convId = res.data?.data?._id;
      if (convId) {
        navigate(`/freelancer/messages?conv=${convId}`);
      }
    } catch {
      // If messaging fails, still navigate to messages page
      navigate('/freelancer/messages');
    } finally {
      setMessaging(false);
    }
  };

  const initials = supervisor?.fullName
    ? supervisor.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <Monitor size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Your Supervisor
        </h2>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 rounded animate-pulse" style={{ background: 'var(--border)' }} />
            ))}
          </div>
        ) : !supervisor ? (
          <div className="py-6 text-center">
            <User size={28} strokeWidth={1} className="mx-auto mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              No supervisor assigned yet.
            </p>
          </div>
        ) : (
          <>
            {/* Profile */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black shrink-0"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {initials}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {supervisor.fullName}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--accent)' }}>
                  Momentum Supervisor
                </div>
                {supervisor.department && (
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    {supervisor.department.replace(/_/g, ' ')} dept.
                  </div>
                )}
              </div>
            </div>

            {/* Stats — only show if real data exists */}
            {(supervisor.totalReviews > 0 || supervisor.approvalRate > 0) && (
              <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                <div className="text-center">
                  <div className="text-base font-black" style={{ color: 'var(--accent)' }}>{supervisor.totalReviews}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-black" style={{ color: 'var(--accent)' }}>{supervisor.approvalRate}%</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Approval</div>
                </div>
              </div>
            )}

            {/* Bio — only if set */}
            {supervisor.bio && (
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                {supervisor.bio}
              </p>
            )}

            {/* Message */}
            <button
              onClick={handleMessageSupervisor}
              disabled={messaging}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <MessageSquare size={14} strokeWidth={1.5} />
              {messaging ? 'Opening chat…' : 'Message Supervisor'}
            </button>
          </>
        )}
      </div>

      {/* Tips */}
      <div className="px-5 pb-5 space-y-2">
        <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
          Learning Tips
        </div>
        {[
          'Watch tutorials at 1.25× speed to save time.',
          'Practice each technique on a real client brief.',
          'Ask your supervisor to review your first deliverable.',
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
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

  const userSkills = [
    ...(user?.primarySkill ? [user.primarySkill] : []),
    ...(Array.isArray(user?.secondarySkills) ? user.secondarySkills : []),
  ].filter((s) => SKILL_LABELS[s]);

  const [activeSkill, setActiveSkill]         = useState(userSkills[0] || null);
  const [activeSoftware, setActiveSoftware]   = useState(
    userSkills[0] ? (SKILL_SOFTWARE[userSkills[0]]?.[0] ?? null) : null
  );
  const [progress, setProgress]               = useState({});
  const [playingTutorial, setPlayingTutorial] = useState(null);
  const [catalogue, setCatalogue]             = useState({});
  const [videosLoading, setVideosLoading]     = useState(true);

  // Fetch catalogue + progress on mount
  useEffect(() => {
    Promise.all([
      api.get('/learning/catalogue'),
      api.get('/freelancer/learning/progress'),
    ]).then(([catRes, progRes]) => {
      setCatalogue(catRes.data?.data ?? {});
      setProgress(progRes.data?.data ?? {});
    }).catch(() => {}).finally(() => setVideosLoading(false));
  }, []);

  function handleSkillChange(skill) {
    setActiveSkill(skill);
    setActiveSoftware(SKILL_SOFTWARE[skill]?.[0] ?? null);
  }

  // Tutorials come from DB catalogue, not hardcoded data
  const tutorials = (activeSoftware && activeSkill)
    ? (catalogue[activeSkill]?.[activeSoftware] ?? [])
    : [];

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

      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main content — 2 cols ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Selection card: skill tabs + software picker */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              {/* Skill tabs */}
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Your Skills
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {userSkills.map((skill) => {
                    const isActive = skill === activeSkill;
                    return (
                      <button
                        key={skill}
                        onClick={() => handleSkillChange(skill)}
                        className="px-4 py-2 rounded-full text-xs font-bold border transition-all"
                        style={{
                          background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                          borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                          color: isActive ? '#fff' : 'var(--text-secondary)',
                        }}
                      >
                        {SKILL_LABELS[skill]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Software picker */}
              {activeSkill && (
                <div className="px-5 py-4">
                  <div className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Select Software
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(SKILL_SOFTWARE[activeSkill] ?? []).map((sw) => {
                      const isActive = sw === activeSoftware;
                      return (
                        <button
                          key={sw}
                          onClick={() => setActiveSoftware(sw)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all"
                          style={{
                            background: isActive ? 'var(--bg-primary)' : 'transparent',
                            borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                            color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                          }}
                        >
                          <Monitor size={12} strokeWidth={1.5} />
                          {sw}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tutorial list */}
            {activeSoftware && (
              <div
                className="rounded-xl border overflow-hidden"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                    <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {activeSoftware}
                    </h2>
                  </div>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                    style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                  >
                    {tutorials.length} lessons
                  </span>
                </div>

                {/* Rows */}
                {tutorials.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No tutorials available yet.</p>
                  </div>
                ) : (
                  <div>
                    {tutorials.map((tutorial, i) => {
                      const levelStyle = LEVEL_STYLES[tutorial.level] || LEVEL_STYLES.Beginner;
                      const isLast = i === tutorials.length - 1;
                      const tProgress = progress[tutorial.id];
                      const isCompleted = tProgress?.completed ?? false;
                      const pct = tProgress?.durationSeconds > 0
                        ? Math.min(100, Math.round((tProgress.watchedSeconds / tProgress.durationSeconds) * 100))
                        : 0;
                      return (
                        <div
                          key={tutorial.id}
                          className={`flex items-center gap-4 px-5 py-4 ${!isLast ? 'border-b' : ''}`}
                          style={{ borderColor: 'var(--border)', background: isCompleted ? 'rgba(96,10,10,0.03)' : 'transparent' }}
                        >
                          {/* Icon */}
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: isCompleted ? 'var(--accent)' : 'var(--bg-card)', color: isCompleted ? '#fff' : 'var(--accent)' }}
                          >
                            {isCompleted
                              ? <CheckCircle2 size={14} strokeWidth={2} />
                              : <Play size={14} strokeWidth={2} />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {tutorial.title}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0" style={levelStyle}>
                                {tutorial.level}
                              </span>
                              {isCompleted && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                                  style={{ background: 'var(--accent)', color: '#fff' }}>
                                  ✓ Complete
                                </span>
                              )}
                            </div>
                            <p className="text-xs truncate mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {tutorial.desc}
                            </p>
                            {/* Inline progress bar */}
                            {pct > 0 && !isCompleted && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)', opacity: 0.7 }} />
                                </div>
                                <span className="text-[9px] font-bold shrink-0" style={{ color: 'var(--accent)' }}>{pct}%</span>
                              </div>
                            )}
                          </div>

                          {/* Duration + CTA */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="hidden sm:flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                              <Clock size={11} strokeWidth={1.5} /> {tutorial.duration}
                            </span>
                            <button
                              onClick={() => setPlayingTutorial(tutorial)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                              style={{
                                background: isCompleted ? 'transparent' : 'var(--accent)',
                                color: isCompleted ? 'var(--accent)' : '#fff',
                                border: isCompleted ? '1px solid var(--accent)' : 'none',
                              }}
                            >
                              <Play size={10} strokeWidth={2} />
                              {isCompleted ? 'Rewatch' : pct > 0 ? 'Continue' : 'Watch'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Supervisor sidebar — 1 col ─────────────────────── */}
          <div className="lg:col-span-1">
            <SupervisorPanel />
          </div>

        </div>
      </div>

      {/* ── Video Player Modal ──────────────────────────────────── */}
      {playingTutorial && (
        <VideoPlayerModal
          tutorial={playingTutorial}
          initialProgress={progress[playingTutorial.id]}
          onClose={() => setPlayingTutorial(null)}
          onComplete={(tutorialId) => {
            setProgress(prev => ({
              ...prev,
              [tutorialId]: { ...(prev[tutorialId] ?? {}), completed: true },
            }));
          }}
        />
      )}
    </>
  );
}
