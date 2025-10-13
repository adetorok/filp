const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get property performance report
router.get('/property-performance', auth, async (req, res) => {
  try {
    const { startDate, endDate, propertyId } = req.query;
    
    const whereClause = {
      userId: req.user.id
    };
    
    if (propertyId) {
      whereClause.propertyId = propertyId;
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const [properties, deals, expenses] = await Promise.all([
      prisma.property.findMany({
        where: whereClause,
        include: {
          deals: true,
          expenses: true
        }
      }),
      prisma.deal.findMany({
        where: whereClause,
        include: {
          property: true,
          expenses: true
        }
      }),
      prisma.expense.findMany({
        where: whereClause,
        include: {
          property: true,
          deal: true
        }
      })
    ]);

    // Calculate performance metrics
    const totalProperties = properties.length;
    const totalDeals = deals.length;
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalInvestment = deals.reduce((sum, deal) => sum + (deal.totalInvestment || 0), 0);
    const totalProfit = deals.reduce((sum, deal) => sum + (deal.estimatedProfit || 0), 0);
    const averageROI = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    res.json({
      summary: {
        totalProperties,
        totalDeals,
        totalExpenses,
        totalInvestment,
        totalProfit,
        averageROI: Math.round(averageROI * 100) / 100
      },
      properties: properties.map(property => ({
        id: property.id,
        address: property.fullAddress,
        status: property.status,
        purchasePrice: property.purchasePrice,
        estimatedARV: property.estimatedARV,
        estimatedProfit: property.estimatedProfit,
        estimatedROI: property.estimatedROI,
        dealCount: property.deals.length,
        totalExpenses: property.expenses.reduce((sum, exp) => sum + exp.amount, 0)
      })),
      deals: deals.map(deal => ({
        id: deal.id,
        title: deal.dealName || 'Untitled Deal',
        propertyAddress: deal.property.fullAddress,
        status: deal.status,
        offerPrice: deal.offerPrice,
        totalInvestment: deal.totalInvestment,
        estimatedARV: deal.estimatedARV,
        estimatedProfit: deal.estimatedProfit,
        estimatedROI: deal.estimatedROI,
        totalExpenses: deal.expenses.reduce((sum, exp) => sum + exp.amount, 0)
      }))
    });
  } catch (error) {
    console.error('Property performance report error:', error);
    res.status(500).json({ error: 'Failed to generate property performance report' });
  }
});

// Get expense breakdown report
router.get('/expense-breakdown', auth, async (req, res) => {
  try {
    const { startDate, endDate, propertyId, dealId } = req.query;
    
    const whereClause = {
      userId: req.user.id
    };
    
    if (propertyId) whereClause.propertyId = propertyId;
    if (dealId) whereClause.dealId = dealId;
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        property: true,
        deal: true
      }
    });

    // Group by category
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = { count: 0, total: 0, expenses: [] };
      }
      acc[category].count++;
      acc[category].total += expense.amount;
      acc[category].expenses.push({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        vendor: expense.vendor,
        date: expense.date,
        propertyAddress: expense.property.fullAddress
      });
      return acc;
    }, {});

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.json({
      summary: {
        totalExpenses,
        totalCount: expenses.length,
        averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0
      },
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        count: data.count,
        total: data.total,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
        expenses: data.expenses
      }))
    });
  } catch (error) {
    console.error('Expense breakdown report error:', error);
    res.status(500).json({ error: 'Failed to generate expense breakdown report' });
  }
});

// Get contractor performance report
router.get('/contractor-performance', auth, async (req, res) => {
  try {
    const contractors = await prisma.contractor.findMany({
      include: {
        reviews: {
          include: {
            project: true
          }
        },
        areaScores: {
          include: {
            area: true
          },
          orderBy: { updatedAt: 'desc' },
          take: 1
        },
        projects: {
          where: {
            status: 'COMPLETED'
          }
        },
        licenses: {
          where: {
            status: 'ACTIVE'
          }
        },
        policies: {
          where: {
            expiresOn: {
              gt: new Date()
            }
          }
        }
      }
    });

    const contractorPerformance = contractors.map(contractor => {
      const latestScore = contractor.areaScores[0];
      const totalReviews = contractor.reviews.length;
      const averageRating = totalReviews > 0 
        ? contractor.reviews.reduce((sum, review) => sum + review.stars, 0) / totalReviews 
        : 0;
      
      const completedProjects = contractor.projects.length;
      const activeLicenses = contractor.licenses.length;
      const activeInsurance = contractor.policies.length;

      return {
        id: contractor.id,
        name: contractor.name,
        companyName: contractor.companyName,
        trades: contractor.trades,
        yearsInBusiness: contractor.yearsInBusiness,
        totalProjects: contractor.totalProjects,
        totalValue: contractor.totalValue,
        completedProjects,
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews,
        currentScore: latestScore?.score || 0,
        currentGrade: latestScore?.grade || 'F',
        hasActiveLicense: activeLicenses > 0,
        hasActiveInsurance: activeInsurance > 0,
        riskLevel: contractor.legalEvents?.length > 0 ? 'HIGH' : 'LOW'
      };
    });

    res.json({
      summary: {
        totalContractors: contractors.length,
        averageRating: contractorPerformance.reduce((sum, c) => sum + c.averageRating, 0) / contractors.length,
        contractorsWithActiveLicenses: contractorPerformance.filter(c => c.hasActiveLicense).length,
        contractorsWithInsurance: contractorPerformance.filter(c => c.hasActiveInsurance).length
      },
      contractors: contractorPerformance.sort((a, b) => b.currentScore - a.currentScore)
    });
  } catch (error) {
    console.error('Contractor performance report error:', error);
    res.status(500).json({ error: 'Failed to generate contractor performance report' });
  }
});

// Get rental income report
router.get('/rental-income', auth, async (req, res) => {
  try {
    const { startDate, endDate, propertyId } = req.query;
    
    const whereClause = {
      userId: req.user.id
    };
    
    if (propertyId) whereClause.rentalPropertyId = propertyId;
    
    if (startDate || endDate) {
      whereClause.receivedDate = {};
      if (startDate) whereClause.receivedDate.gte = new Date(startDate);
      if (endDate) whereClause.receivedDate.lte = new Date(endDate);
    }

    const [income, expenses, properties] = await Promise.all([
      prisma.rentalIncome.findMany({
        where: whereClause,
        include: {
          rentalProperty: {
            include: {
              property: true
            }
          },
          tenant: true
        }
      }),
      prisma.rentalExpense.findMany({
        where: {
          userId: req.user.id,
          ...(propertyId && { rentalPropertyId: propertyId }),
          ...(startDate || endDate ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) })
            }
          } : {})
        },
        include: {
          rentalProperty: {
            include: {
              property: true
            }
          }
        }
      }),
      prisma.rentalProperty.findMany({
        where: {
          userId: req.user.id,
          ...(propertyId && { id: propertyId })
        },
        include: {
          property: true,
          tenants: true
        }
      })
    ]);

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    // Group by property
    const propertyBreakdown = properties.map(property => {
      const propertyIncome = income.filter(item => item.rentalPropertyId === property.id);
      const propertyExpenses = expenses.filter(item => item.rentalPropertyId === property.id);
      
      const propertyTotalIncome = propertyIncome.reduce((sum, item) => sum + item.amount, 0);
      const propertyTotalExpenses = propertyExpenses.reduce((sum, item) => sum + item.amount, 0);
      
      return {
        id: property.id,
        address: property.property.fullAddress,
        monthlyRent: property.monthlyRent,
        totalIncome: propertyTotalIncome,
        totalExpenses: propertyTotalExpenses,
        netIncome: propertyTotalIncome - propertyTotalExpenses,
        occupancyRate: property.tenants.length > 0 ? 100 : 0,
        tenantCount: property.tenants.length
      };
    });

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        totalProperties: properties.length,
        averageMonthlyRent: properties.length > 0 
          ? properties.reduce((sum, p) => sum + p.monthlyRent, 0) / properties.length 
          : 0
      },
      propertyBreakdown,
      incomeByCategory: income.reduce((acc, item) => {
        const category = item.category;
        if (!acc[category]) acc[category] = 0;
        acc[category] += item.amount;
        return acc;
      }, {}),
      expenseByCategory: expenses.reduce((acc, item) => {
        const category = item.category;
        if (!acc[category]) acc[category] = 0;
        acc[category] += item.amount;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Rental income report error:', error);
    res.status(500).json({ error: 'Failed to generate rental income report' });
  }
});

module.exports = router;