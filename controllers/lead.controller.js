const { prisma } = require('../prisma/client');
const { getIO } = require('../services/socket'); // 1. getIO को import करें

// 1. एक नई Lead (लीड) बनाना
exports.createLead = async (req, res) => {
  const { name, email, phone } = req.body;
  const ownerId = req.user.id;

  try {
    const newLead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        ownerId,
      },
    });
    res.status(201).json(newLead);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'यह ईमेल पहले से ही एक लीड से जुड़ा है।' });
    }
    res.status(500).json({ message: 'लीड बनाने में एरर आया', error: error.message });
  }
};

// 2. सभी Leads (लीड्स) प्राप्त करना (भूमिका के आधार पर)
exports.getAllLeads = async (req, res) => {
  const { role, id: userId } = req.user;

  try {
    let leads;
    if (role === 'ADMIN' || role === 'MANAGER') {
      leads = await prisma.lead.findMany({
        include: {
          owner: { select: { name: true } }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    } else {
      leads = await prisma.lead.findMany({
        where: {
          ownerId: userId,
        },
        include: {
          owner: { select: { name: true } }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    }
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: 'लीड्स लाने में एरर आया', error: error.message });
  }
};

// 3. ID द्वारा एक Lead (लीड) और उसकी Activities प्राप्त करना
exports.getLeadById = async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        owner: {
          select: { name: true },
        },
        activities: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!lead) {
      return res.status(404).json({ message: 'लीड नहीं मिली' });
    }

    if (role === 'SALES_EXECUTIVE' && lead.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden: आप इस लीड को देखने के लिए अधिकृत नहीं हैं' });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: 'लीड विवरण लाने में एरर आया', error: error.message });
  }
};

// 4. Lead (लीड) की स्थिति (Status) को अपडेट करना और Activity लॉग करना (Socket.io के साथ)
exports.updateLeadStatus = async (req, res) => {
  const { id: leadId } = req.params;
  const { status } = req.body;
  const { id: userId, role } = req.user;

  try {
    // 1. अनुमति की जाँच करें
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ message: 'लीड नहीं मिली' });
    }
    if (role === 'SALES_EXECUTIVE' && lead.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden: आप इस लीड को अपडेट करने के लिए अधिकृत नहीं हैं' });
    }

    // 2. स्थिति (Status) को अपडेट करें
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    // 3. इस बदलाव को एक गतिविधि (Activity) के रूप में लॉग करें
    const newActivity = await prisma.activity.create({
      data: {
        type: 'STATUS_CHANGE',
        content: `Status changed to ${status}`,
        leadId: leadId,
        userId: userId,
      },
    });

    // 2. (updateLeadStatus) Socket.io इवेंट्स Emit करें
    try {
      const io = getIO();
      // यह फ्रंटएंड को बताता है कि इस लीड का डेटा रीफ्रेश करें
      io.emit('lead_update', { leadId: updatedLead.id, message: 'Lead status updated' });
      // यह फ्रंटएंड को बताता है कि टाइमलाइन में एक नई गतिविधि जोड़ें
      io.emit('new_activity', newActivity);
    } catch (socketError) {
      console.error("Socket.io emit error:", socketError.message);
    }
    
    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: 'लीड स्थिति अपडेट करने में एरर आया', error: error.message });
  }
};

// 5. एक Lead (लीड) में नई Activity (गतिविधि) जोड़ना (Socket.io के साथ)
exports.addActivity = async (req, res) => {
  const { id: leadId } = req.params;
  const { type, content } = req.body;
  const { id: userId, role } = req.user;

  if (type === 'STATUS_CHANGE') {
    return res.status(400).json({ message: 'STATUS_CHANGE प्रकार की गतिविधि केवल स्थिति अपडेट होने पर स्वचालित रूप से लॉग होती है।' });
  }

  try {
    // 1. अनुमति की जाँच करें
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return res.status(404).json({ message: 'लीड नहीं मिली' });
    }
    if (role === 'SALES_EXECUTIVE' && lead.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden: आप इस लीड में गतिविधि जोड़ने के लिए अधिकृत नहीं हैं' });
    }

    // 2. नई गतिविधि (Activity) बनाएँ
    const newActivity = await prisma.activity.create({
      data: {
        type,
        content,
        leadId,
        userId,
      },
    });

    // 3. (addActivity) Socket.io इवेंट्स Emit करें
    try {
      const io = getIO();
      // यह फ्रंटएंड को बताता है कि इस लीड का डेटा रीफ्रेश करें (जैसे, 'updatedAt' समय)
      io.emit('lead_update', { leadId: newActivity.leadId, message: 'New activity added' });
      // यह फ्रंटएंड को बताता है कि टाइमलाइन में एक नई गतिविधि जोड़ें
      io.emit('new_activity', newActivity);
    } catch (socketError) {
      console.error("Socket.io emit error:", socketError.message);
    }

    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ message: 'गतिविधि जोड़ने में एरर आया', error: error.message });
  }
};

// 6. एक Lead (लीड) को डिलीट करना
exports.deleteLead = async (req, res) => {
  const { id: leadId } = req.params;

  try {
    await prisma.$transaction([
      prisma.activity.deleteMany({
        where: { leadId: leadId },
      }),
      prisma.lead.delete({
        where: { id: leadId },
      }),
    ]);

    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'लीड नहीं मिली' });
    }
    res.status(500).json({ message: 'लीड डिलीट करने में एरर आया', error: error.message });
  }
};