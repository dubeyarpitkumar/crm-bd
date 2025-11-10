const { prisma } = require('../prisma/client');

// 1. मुख्य आँकड़े (Stats) प्राप्त करना
exports.getStats = async (req, res) => {
  try {
    // हम तीनों काउंट्स (counts) को समानांतर (parallel) में चलाने के लिए
    // $transaction का उपयोग कर सकते हैं ताकि वे तेज़ लोड हों।
    const [totalSalesExecutives, totalLeads, convertedLeads] = await prisma.$transaction([
      prisma.user.count({
        where: { role: 'SALES_EXECUTIVE' },
      }),
      prisma.lead.count(),
      prisma.lead.count({
        where: { status: 'WON' },
      }),
    ]);

    // 200 स्थिति के साथ ऑब्जेक्ट भेजें
    res.status(200).json({
      totalSalesExecutives,
      totalLeads,
      convertedLeads,
    });
  } catch (error) {
    res.status(500).json({ message: 'आँकड़े लाने में एरर आया', error: error.message });
  }
};

// 2. स्थिति (Status) के आधार पर Leads (लीड्स) प्राप्त करना (Pie Chart के लिए)
exports.getLeadsByStatus = async (req, res) => {
  try {
    const leadsByStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // डेटा को चार्ट (Chart.js / Recharts) के लिए आसान फॉर्मेट में बदलना
    // [{ status: 'NEW', _count: { status: 5 } }] से
    // [{ name: 'NEW', value: 5 }] में बदलना
    const formattedData = leadsByStatus.map(item => ({
      name: item.status,
      value: item._count.status,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'स्थिति के आधार पर लीड्स लाने में एरर आया', error: error.message });
  }
};

// 3. टॉप 5 सेल्स एग्जीक्यूटिव्स (Sales Executives) प्राप्त करना
exports.getTopSalesExecutives = async (req, res) => {
  try {
    // (यह तरीका बेहतर है क्योंकि यह एक ही क्वेरी में नाम और काउंट लाता है)
    const topSalesExecutives = await prisma.user.findMany({
      // केवल 'SALES_EXECUTIVE' को शामिल करें
      where: {
        role: 'SALES_EXECUTIVE',
      },
      // उनके 'leadsOwned' (लीड्स) की संख्या को शामिल करें
      include: {
        _count: {
          select: { leadsOwned: true },
        },
      },
      // लीड्स की संख्या के आधार पर (घटते क्रम में) ऑर्डर करें
      orderBy: {
        leadsOwned: {
          _count: 'desc',
        },
      },
      // केवल टॉप 5
      take: 5,
    });

    // डेटा को फ्रंटएंड के लिए सरल बनाना
    // [{ name: '...', _count: { leadsOwned: 10 } }] से
    // [{ name: '...', leadsCount: 10 }] में बदलना
    const formattedData = topSalesExecutives.map(user => ({
      name: user.name,
      leadsCount: user._count.leadsOwned,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'टॉप सेल्स एग्जीक्यूटिव्स लाने में एरर आया', error: error.message });
  }
};