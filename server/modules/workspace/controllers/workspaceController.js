const Workspace = require('../models/Workspace');
const Channel = require('../models/Channel');

exports.getMyWorkspace = async (req, res) => {
  try {
    // For MVP/Demo without heavy auth, we might fallback to finding *any* workspace
    // or creating one for a default user if req.user is missing.
    // In strict integration, req.user.id usage is perfect.
    
    // Fallback ID for demo if auth middleware isn't populating req.user
    const userId = req.user ? req.user.id : "demo_user_123";

    let workspace = await Workspace.findOne({ members: userId });

    // Auto-create if not exists (Demo functionality)
    if (!workspace) {
      workspace = new Workspace({
        name: "Student Workspace",
        type: "student",
        members: [userId]
      });
      await workspace.save();

      // Create default channels
      await Channel.insertMany([
        { workspaceId: workspace._id, name: "general", type: "text" },
        { workspaceId: workspace._id, name: "announcements", type: "announcement" },
        { workspaceId: workspace._id, name: "resources", type: "materials" },
        { workspaceId: workspace._id, name: "questions", type: "text" }
      ]);
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createWorkspace = async (req, res) => {
    try {
        const { name, type } = req.body;
        const workspace = new Workspace({
            name,
            type,
            members: [req.user ? req.user.id : "demo_user_123"]
        });
        await workspace.save();
        res.status(201).json(workspace);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}
