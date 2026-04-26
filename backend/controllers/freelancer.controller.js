import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Freelancer } from '../models/Freelancer.js';
import { MicroTask } from '../models/MicroTask.js';
import { Submission } from '../models/Submission.js';
import { Project } from '../models/Project.js';
import { LearningProgress } from '../models/LearningProgress.js';
import { LearningVideo } from '../models/LearningVideo.js';

const COMPLETION_THRESHOLD = 0.80; // 80% watched = complete

// Promotion requirements
const PROMO_REQUIREMENTS = {
  Beginner:     12,
  Intermediate: 10,
  Advanced:     8,
};

// ── GET /freelancer/learning/progress ────────────────────────────
export const getLearningProgress = asyncHandler(async (req, res) => {
  const records = await LearningProgress.find({ freelancerId: req.user._id });
  // Return a map: { [tutorialId]: { watchedSeconds, durationSeconds, completed, lastPosition } }
  const map = {};
  for (const r of records) {
    map[r.tutorialId] = {
      watchedSeconds:  r.watchedSeconds,
      durationSeconds: r.durationSeconds,
      completed:       r.completed,
      lastPosition:    r.lastPosition,
      completedAt:     r.completedAt,
    };
  }
  res.json(new ApiResponse(200, map, 'Learning progress fetched'));
});

// ── POST /freelancer/learning/progress ───────────────────────────
// Body: { tutorialId, watchedSeconds, durationSeconds, lastPosition }
export const reportWatchProgress = asyncHandler(async (req, res) => {
  const { tutorialId, watchedSeconds, durationSeconds, lastPosition } = req.body;

  if (!tutorialId) return res.status(400).json(new ApiResponse(400, null, 'tutorialId is required'));

  const existing = await LearningProgress.findOne({
    freelancerId: req.user._id,
    tutorialId,
  });

  // Never decrease watchedSeconds (user might seek back)
  const newWatched = Math.max(existing?.watchedSeconds ?? 0, watchedSeconds ?? 0);
  const duration   = durationSeconds || existing?.durationSeconds || 0;

  const justCompleted =
    !existing?.completed &&
    duration > 0 &&
    newWatched / duration >= COMPLETION_THRESHOLD;

  const record = await LearningProgress.findOneAndUpdate(
    { freelancerId: req.user._id, tutorialId },
    {
      $set: {
        watchedSeconds:  newWatched,
        durationSeconds: duration,
        lastPosition:    lastPosition ?? 0,
        ...(justCompleted && { completed: true, completedAt: new Date() }),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  res.json(new ApiResponse(200, {
    tutorialId,
    watchedSeconds:  record.watchedSeconds,
    durationSeconds: record.durationSeconds,
    completed:       record.completed,
    justCompleted,
  }, justCompleted ? 'Tutorial marked complete!' : 'Progress saved'));
});

// ── GET /freelancer/learning/promotion-status ─────────────────────
// Returns per-software completion counts and overall promotion eligibility
export const getPromotionStatus = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findById(req.user._id);

  // Get all completed progress records for this user
  const completedRecords = await LearningProgress.find({
    freelancerId: req.user._id,
    completed: true,
  }).lean();

  const completedIds = new Set(completedRecords.map(r => r.tutorialId));

  // Load all learning videos from DB
  const allDocs = await LearningVideo.find().lean();

  // Build a map: softwareKey → { Beginner: count, Intermediate: count, Advanced: count }
  // tutorialId is the youtubeId (used as unique identifier per video)
  const softwareStats = {};

  for (const doc of allDocs) {
    const key = `${doc.skill}__${doc.software}`;
    if (!softwareStats[key]) {
      softwareStats[key] = { skill: doc.skill, software: doc.software, Beginner: 0, Intermediate: 0, Advanced: 0 };
    }

    // Collect all videos from tutorials, playlists, crash_courses
    const allVideos = [
      ...doc.tutorials.map(t => ({ youtubeId: t.youtubeId, level: t.level })),
      ...doc.playlists.flatMap(p => p.videos.map(v => ({ youtubeId: v.youtubeId, level: p.level }))),
      ...doc.crash_courses.flatMap(c => c.videos.map(v => ({ youtubeId: v.youtubeId, level: c.level }))),
    ];

    // Deduplicate by youtubeId
    const seen = new Set();
    for (const v of allVideos) {
      if (seen.has(v.youtubeId)) continue;
      seen.add(v.youtubeId);
      if (completedIds.has(v.youtubeId)) {
        softwareStats[key][v.level] = (softwareStats[key][v.level] || 0) + 1;
      }
    }
  }

  // Find the software with the maximum completed videos per level
  // Rule: pick the software that gives the best score per level independently
  const bestPerLevel = { Beginner: 0, Intermediate: 0, Advanced: 0 };
  const bestSoftwarePerLevel = { Beginner: null, Intermediate: null, Advanced: null };

  for (const [key, stats] of Object.entries(softwareStats)) {
    for (const level of ['Beginner', 'Intermediate', 'Advanced']) {
      if (stats[level] > bestPerLevel[level]) {
        bestPerLevel[level] = stats[level];
        bestSoftwarePerLevel[level] = stats.software;
      }
    }
  }

  // Check eligibility
  const eligible =
    bestPerLevel.Beginner     >= PROMO_REQUIREMENTS.Beginner &&
    bestPerLevel.Intermediate >= PROMO_REQUIREMENTS.Intermediate &&
    bestPerLevel.Advanced     >= PROMO_REQUIREMENTS.Advanced;

  // Update promotionEligible on freelancer if changed
  if (eligible !== freelancer.promotionEligible) {
    await Freelancer.findByIdAndUpdate(req.user._id, { promotionEligible: eligible });
  }

  res.json(new ApiResponse(200, {
    requirements: PROMO_REQUIREMENTS,
    progress: bestPerLevel,
    bestSoftware: bestSoftwarePerLevel,
    softwareStats,   // full per-software breakdown for the expanded view
    eligible,
    alreadyApplied: freelancer.promotionApplied ?? false,
    currentTier: freelancer.tier,
  }, 'Promotion status fetched'));
});

// ── POST /freelancer/learning/apply-promotion ─────────────────────
export const applyForPromotion = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findById(req.user._id);

  if (!freelancer.promotionEligible) {
    return res.status(400).json(new ApiResponse(400, null, 'You have not met the promotion requirements yet'));
  }
  if (freelancer.promotionApplied) {
    return res.status(400).json(new ApiResponse(400, null, 'You have already applied for promotion'));
  }

  await Freelancer.findByIdAndUpdate(req.user._id, { promotionApplied: true, promotionAppliedAt: new Date() });

  res.json(new ApiResponse(200, { applied: true }, 'Promotion application submitted! Your supervisor will review it.'));
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const { primarySkill, secondarySkills, hoursPerWeek, preferredContactTime, portfolioUrl, dateOfBirth, supervisorCode } = req.body;

  if (!primarySkill) return res.status(400).json(new ApiResponse(400, null, 'Primary skill is required'));
  if (!hoursPerWeek) return res.status(400).json(new ApiResponse(400, null, 'Weekly availability is required'));
  if (!preferredContactTime) return res.status(400).json(new ApiResponse(400, null, 'Preferred contact time is required'));

  // ── Resolve supervisor ────────────────────────────────────────
  let mentorId = null;
  const { MomentumSupervisor } = await import('../models/MomentumSupervisor.js');

  if (supervisorCode?.trim()) {
    // User provided a code — find that specific supervisor
    const supervisor = await MomentumSupervisor.findOne({
      supervisorCode: supervisorCode.trim().toUpperCase(),
      isSuspended: { $ne: true },
    });
    if (!supervisor) {
      return res.status(400).json(new ApiResponse(400, null, 'Invalid supervisor code. Please check and try again.'));
    }
    mentorId = supervisor._id;
  } else {
    // Auto-assign: supervisor with fewest precrate freelancers
    const supervisors = await MomentumSupervisor.find({ isSuspended: { $ne: true } }).select('_id').lean();
    if (supervisors.length > 0) {
      const counts = await Promise.all(
        supervisors.map(async (s) => ({
          id: s._id,
          count: await Freelancer.countDocuments({ mentorId: s._id, tier: 'precrate' }),
        }))
      );
      counts.sort((a, b) => a.count - b.count);
      mentorId = counts[0].id;
    }
  }

  const updateData = {
    primarySkill,
    secondarySkills: secondarySkills || [],
    hoursPerWeek,
    preferredContactTime,
    portfolioUrl: portfolioUrl || '',
    dateOfBirth: dateOfBirth || null,
    onboardingComplete: true,
    ...(mentorId && { mentorId }),
  };

  const freelancer = await Freelancer.findByIdAndUpdate(req.user._id, updateData, { new: true });

  // Add freelancer to supervisor's list
  if (mentorId) {
    await MomentumSupervisor.findByIdAndUpdate(mentorId, {
      $addToSet: { supervisedFreelancers: req.user._id },
    });
  }

  res.json(new ApiResponse(200, { onboardingComplete: true, freelancer }, 'Onboarding complete'));
});

export const getSupervisor = asyncHandler(async (req, res) => {
  const { MomentumSupervisor } = await import('../models/MomentumSupervisor.js');

  // Get the freelancer's assigned mentor
  const freelancer = await Freelancer.findById(req.user._id).select('mentorId').lean();

  let supervisor = null;
  if (freelancer?.mentorId) {
    supervisor = await MomentumSupervisor.findById(freelancer.mentorId)
      .select('fullName email avatar supervisorCode department supervisedFreelancers')
      .lean();
  }

  // Fallback: return any available supervisor
  if (!supervisor) {
    supervisor = await MomentumSupervisor.findOne({ isSuspended: { $ne: true } })
      .select('fullName email avatar supervisorCode department supervisedFreelancers')
      .lean();
  }

  res.json(new ApiResponse(200, supervisor, supervisor ? 'Supervisor found' : 'No supervisor assigned yet'));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findById(req.user._id);
  
  const availableTasksCount = await MicroTask.countDocuments({ 
    skillRequired: freelancer.primarySkill,
    status: 'unassigned'
  });

  const recentTasks = await MicroTask.find({ assignedTo: req.user._id }).sort({ updatedAt: -1 }).limit(5);

  const stats = {
    availableTasks: availableTasksCount,
    completedTasks: freelancer.tasksCompleted,
    totalEarnings: freelancer.totalEarnings,
  };

  const rankMeta = {
    nextTaskThreshold: freelancer.tier === 'precrate' ? 5 : 20,
    nextEarningsThreshold: freelancer.tier === 'precrate' ? 200 : 5000,
  };

  res.json(new ApiResponse(200, { stats, tasks: recentTasks, rankMeta, freelancer }));
});

export const getAvailableTasks = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findById(req.user._id);
  const tasks = await MicroTask.find({
    skillRequired: freelancer.primarySkill,
    status: 'unassigned'
  }).populate('projectId', 'title category budget');
  
  res.json(new ApiResponse(200, tasks));
});

export const getTaskDetail = asyncHandler(async (req, res) => {
  const task = await MicroTask.findById(req.params.id).populate('projectId');
  if (!task) return res.status(404).json(new ApiResponse(404, null, 'Task not found'));
  res.json(new ApiResponse(200, task));
});

export const submitDeliverable = asyncHandler(async (req, res) => {
  const { fileUrl, notes } = req.body;
  const task = await MicroTask.findOne({ _id: req.params.id, assignedTo: req.user._id });
  
  if (!task) return res.status(404).json(new ApiResponse(404, null, 'Task not found or not assigned to you'));

  const submission = await Submission.create({
    microTaskId: task._id,
    freelancerId: req.user._id,
    fileUrl,
    notes
  });

  task.status = 'submitted';
  task.submission = submission._id;
  await task.save();

  res.json(new ApiResponse(200, submission, 'Deliverable submitted successfully'));
});
