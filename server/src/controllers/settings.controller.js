const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSettings = async (req, res) => {
  try {
    const settings = await prisma.storeSetting.findMany();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    res.status(200).json({ success: true, settings: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ success: false, message: 'Key is required' });

    const updated = await prisma.storeSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    
    res.status(200).json({ success: true, setting: updated });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
