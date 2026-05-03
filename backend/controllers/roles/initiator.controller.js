import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { Project } from '../../models/projects/Project.js';
import { MicroTask } from '../../models/projects/MicroTask.js';
import { Freelancer } from '../../models/users/Freelancer.js';
import { Team } from '../../models/projects/Team.js';

const myId = (req) => req.user._id;

// ── helpers ──────────────────────────────────────────────────────
const populateProject = (q) =>
  q
    .populate('clientId', 'fullName email company avatar')
    .populate('assignedInitiatorId', 'fullName primarySkill tier')
    .populate('coInitiators', 'fullName primarySkill tier rating')
    .lean();

// ── GET /initiator/projects/team ─────────────────────────────────
// Projects where this initiator leads a crate team
export const getTeamProjects = asyncHandler(async (req, res) => {
  const projects = await populateProject(
    Project.find({
      assignedInitiatorId: myId(req),
      projectType: 'team',
      status: { $in: ['in_progress', 'open', 'under_review'] },
    })
  );

  // Attach team + task summary for each project
  const enriched = await Promise.all(projects.map(async (p) => {
    const team = await Team.findOne({ projectId: p._id })
      .populate('members', 'fullName primarySkill tier rating tasksCompleted')
      .lean();
    const tasks = await MicroTask.find({ projectId: p._id })
      .populate('assignedTo', 'fullName tier')
      .lean();
    return { ...p, team, tasks };
  }));

  res.json(new ApiResponse(200, enriched, 'Team projects fetched'));
});

// ── GET /initiator/projects/group ────────────────────────────────
// Group projects assigned by a Momentum Supervisor — multiple initiators
export const getGroupProjects = asyncHandler(async (req, res) => {
  const projects = await populateProject(
    Project.find({
      projectType: 'group',
      $or: [
        { assignedInitiatorId: myId(req) },
        { coInitiators: myId(req) },
      ],
    })
  );

  const enriched = await Promise.all(projects.map(async (p) => {
    const tasks = await MicroTask.find({ projectId: p._id })
      .populate('assignedTo', 'fullName tier')
      .lean();
    return { ...p, tasks };
  }));

  res.json(new ApiResponse(200, enriched, 'Group projects fetched'));
});

// ── GET /initiator/projects/personal ────────────────────────────
// Personal projects chosen/assigned directly to this initiator
export const getPersonalProjects = asyncHandler(async (req, res) => {
  const projects = await populateProject(
    Project.find({
      assignedInitiatorId: myId(req),
      projectType: 'personal',
    })
  );

  const enriched = await Promise.all(projects.map(async (p) => {
    const tasks = await MicroTask.find({ projectId: p._id }).lean();
    return { ...p, tasks };
  }));

  res.json(new ApiResponse(200, enriched, 'Personal projects fetched'));
});

// ── GET /initiator/clients ───────────────────────────────────────
// Clients assigned to this initiator
export const getMyClients = asyncHandler(async (req, res) => {
  const initiator = await Freelancer.findById(myId(req))
    .populate('assignedClients', 'fullName email company avatar createdAt')
    .lean();

  const clients = initiator?.assignedClients ?? [];

  // For each client, attach their active project count
  const enriched = await Promise.all(clients.map(async (c) => {
    const activeCount = await Project.countDocuments({
      clientId: c._id,
      assignedInitiatorId: myId(req),
      status: { $in: ['open', 'in_progress', 'under_review'] },
    });
    const totalCount = await Project.countDocuments({
      clientId: c._id,
      assignedInitiatorId: myId(req),
    });
    return { ...c, activeProjects: activeCount, totalProjects: totalCount };
  }));

  res.json(new ApiResponse(200, enriched, 'Clients fetched'));
});

// ── GET /initiator/open-projects ─────────────────────────────────
// Open projects posted by clients (isOpenProject: true, status: 'open')
export const getOpenProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    isOpenProject: true,
    status: 'open',
    assignedInitiatorId: { $exists: false },
  })
    .populate('clientId', 'fullName email company avatar')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(new ApiResponse(200, projects, 'Open projects fetched'));
});

// ── POST /initiator/open-projects/:id/accept ────────────────────
// Initiator accepts an open project
export const acceptOpenProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, isOpenProject: true, status: 'open' });
  if (!project) throw new ApiError(404, 'Project not found or already taken');

  project.assignedInitiatorId = myId(req);
  project.projectType = 'personal';
  project.status = 'in_progress';
  await project.save();

  res.json(new ApiResponse(200, project, 'Project accepted'));
});

// ── GET /initiator/work ──────────────────────────────────────────
// Work feed: task updates from crate members + co-initiator progress on group projects
export const getWorkFeed = asyncHandler(async (req, res) => {
  // All projects this initiator is involved in
  const projectIds = await Project.find({
    $or: [
      { assignedInitiatorId: myId(req) },
      { coInitiators: myId(req) },
    ],
  }).distinct('_id');

  // All tasks across those projects with recent updates
  const tasks = await MicroTask.find({
    projectId: { $in: projectIds },
    status: { $in: ['submitted', 'approved', 'rejected', 'assigned'] },
  })
    .populate('projectId', 'title projectType status deadline deadlineExtended')
    .populate('assignedTo', 'fullName tier primarySkill')
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();

  // Group by project
  const byProject = {};
  for (const task of tasks) {
    const pid = task.projectId?._id?.toString();
    if (!pid) continue;
    if (!byProject[pid]) {
      byProject[pid] = {
        project: task.projectId,
        tasks: [],
      };
    }
    byProject[pid].tasks.push(task);
  }

  // For group projects — also get co-initiator task summaries
  const groupProjects = await Project.find({
    _id: { $in: projectIds },
    projectType: 'group',
  })
    .populate('coInitiators', 'fullName tier primarySkill')
    .lean();

  const groupSummaries = await Promise.all(groupProjects.map(async (gp) => {
    const allTasks = await MicroTask.find({ projectId: gp._id })
      .populate('assignedTo', 'fullName tier')
      .lean();

    // Group tasks by assignedTo initiator
    const byInitiator = {};
    for (const t of allTasks) {
      const aid = t.assignedTo?._id?.toString() || 'unassigned';
      if (!byInitiator[aid]) {
        byInitiator[aid] = { member: t.assignedTo, tasks: [] };
      }
      byInitiator[aid].tasks.push(t);
    }

    return {
      project: gp,
      byInitiator: Object.values(byInitiator),
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === 'approved').length,
    };
  }));

  res.json(new ApiResponse(200, {
    taskFeed: Object.values(byProject),
    groupSummaries,
  }, 'Work feed fetched'));
});

// ── GET /initiator/dashboard ─────────────────────────────────────
export const getInitiatorDashboard = asyncHandler(async (req, res) => {
  const [teamCount, groupCount, personalCount, openCount] = await Promise.all([
    Project.countDocuments({ assignedInitiatorId: myId(req), projectType: 'team', status: { $in: ['open', 'in_progress', 'under_review'] } }),
    Project.countDocuments({ $or: [{ assignedInitiatorId: myId(req) }, { coInitiators: myId(req) }], projectType: 'group' }),
    Project.countDocuments({ assignedInitiatorId: myId(req), projectType: 'personal' }),
    Project.countDocuments({ isOpenProject: true, status: 'open', assignedInitiatorId: { $exists: false } }),
  ]);

  const recentTasks = await MicroTask.find({
    projectId: {
      $in: await Project.find({ assignedInitiatorId: myId(req) }).distinct('_id'),
    },
    status: { $in: ['submitted', 'approved'] },
  })
    .populate('projectId', 'title')
    .populate('assignedTo', 'fullName')
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  res.json(new ApiResponse(200, {
    stats: { teamCount, groupCount, personalCount, openCount },
    recentTasks,
  }, 'Dashboard fetched'));
});
