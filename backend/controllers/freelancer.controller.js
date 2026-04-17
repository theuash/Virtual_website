import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Freelancer } from '../models/Freelancer.js';
import { MicroTask } from '../models/MicroTask.js';
import { Submission } from '../models/Submission.js';
import { Project } from '../models/Project.js';

export const completeOnboarding = asyncHandler(async (req, res) => {
  const { primarySkill, secondarySkills, hoursPerWeek, preferredContactTime, portfolioUrl, dateOfBirth } = req.body;

  if (!primarySkill) return res.status(400).json(new ApiResponse(400, null, 'Primary skill is required'));
  if (!hoursPerWeek) return res.status(400).json(new ApiResponse(400, null, 'Weekly availability is required'));
  if (!preferredContactTime) return res.status(400).json(new ApiResponse(400, null, 'Preferred contact time is required'));

  const freelancer = await Freelancer.findByIdAndUpdate(
    req.user._id,
    {
      primarySkill,
      secondarySkills: secondarySkills || [],
      hoursPerWeek,
      preferredContactTime,
      portfolioUrl: portfolioUrl || '',
      dateOfBirth: dateOfBirth || null,
      onboardingComplete: true,
    },
    { new: true }
  );

  res.json(new ApiResponse(200, { onboardingComplete: true, freelancer }, 'Onboarding complete'));
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
