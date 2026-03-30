const Complaint = require('../models/Complaint');

// Generate complaint ID in mobile app format: SNT-YYYY-MUM-NNNNNN
const generateComplaintId = () => {
  const year = new Date().getFullYear();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `SNT-${year}-MUM-${num}`;
};

// GET /v1/complaints
exports.listComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      complaints: complaints.map(c => ({
        id: c.id,
        complaintId: c.complaintId,
        category: c.category,
        description: c.description,
        status: c.status,
        timestamp: c.createdAt,
        escalationTier: c.escalationTier,
        resolution: c.resolution,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /v1/complaints/:id
exports.trackComplaint = async (req, res, next) => {
  try {
    // Support both UUID id and complaint string id (e.g. SNT-2025-MUM-123456)
    const { id } = req.params;
    const where = { userId: req.user.userId };
    if (id.startsWith('SNT-')) {
      where.complaintId = id;
    } else {
      where.id = id;
    }

    const complaint = await Complaint.findOne({ where });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    res.json({
      id: complaint.id,
      complaintId: complaint.complaintId,
      category: complaint.category,
      description: complaint.description,
      status: complaint.status,
      escalationTier: complaint.escalationTier,
      resolution: complaint.resolution,
      referenceId: complaint.referenceId,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      timeline: [
        { stage: 'Submitted', status: 'done', timestamp: complaint.createdAt },
        { stage: 'Under Review', status: complaint.status !== 'Open' ? 'done' : 'pending', timestamp: null },
        { stage: 'Resolution', status: complaint.status === 'Resolved' ? 'done' : 'pending', timestamp: null },
      ],
    });
  } catch (err) {
    next(err);
  }
};

// POST /v1/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const { category, description, referenceId } = req.body;
    if (!description) return res.status(400).json({ error: 'description is required' });

    const complaint = await Complaint.create({
      userId: req.user.userId,
      complaintId: generateComplaintId(),
      category: category || 'Other',
      description,
      referenceId,
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      complaint: {
        id: complaint.id,
        complaintId: complaint.complaintId,
        category: complaint.category,
        description: complaint.description,
        status: complaint.status,
        timestamp: complaint.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/complaints/:id/status (internal/admin use)
exports.updateStatus = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ where: { id: req.params.id } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const { status, resolution, escalationTier } = req.body;
    await complaint.update({ status, resolution, escalationTier });
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};
