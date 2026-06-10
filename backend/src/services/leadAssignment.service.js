const User = require("../models/User");
const Lead = require("../models/Lead");

const assignLeadAutomatically = async () => {

  const executives = await User.find({
    role: "executive",
    isActive: true
  });

  if (!executives.length) {
    return null;
  }

  let selectedExecutive = null;
  let minLeadCount = Infinity;

  for (const executive of executives) {

    const leadCount = await Lead.countDocuments({
      assignedTo: executive._id,
      status: {
        $nin: [
          "Converted",
          "Closed"
        ]
      }
    });

    if (leadCount < minLeadCount) {

      minLeadCount = leadCount;

      selectedExecutive = executive;
    }
  }

  return selectedExecutive;
};

module.exports = {
  assignLeadAutomatically
};