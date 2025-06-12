const getWeeklyCalories = async (request, h) => {
    try {
      const { prisma, auth } = request;
  
      // Get user's target calories
      const user = await prisma.userProfile.findUnique({
        where: { id: auth.userId },
        select: { targetCalories: true }
      });
  
      if (!user) {
        return h.response({
          status: 'fail',
          message: 'User not found'
        }).code(404);
      }
  
      const targetCalories = user.targetCalories || 2000; // Default target if not set
  
      // Calculate start of current week (Sunday)
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - currentDay);
      startOfWeek.setHours(0, 0, 0, 0);
  
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
  
      // Get history data for the current week
      const histories = await prisma.history.findMany({
        where: {
          userId: auth.userId,
          selectedAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        },
        include: {
          receipt: {
            select: {
              kalori: true
            }
          }
        }
      });
  
            // Initialize weekly data array
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weeklyData = dayNames.map((day, index) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + index);
        
        const isToday = dayDate.getTime() === today.getTime();
        
        return {
          day,
          calories: 0,
          target: targetCalories,
          date: dayDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
          isToday: isToday
        };
      });

      // Aggregate calories by day
      histories.forEach(history => {
        const historyDate = new Date(history.selectedAt);
        const dayIndex = historyDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        weeklyData[dayIndex].calories += Math.round(history.receipt.kalori || 0);
      });
  
      return h.response({
        status: 'success',
        data: { weeklyData }
      }).code(200);
  
    } catch (error) {
      console.error('Get weekly calories error:', error);
      return h.response({
        status: 'error',
        message: 'Failed to fetch weekly calories'
      }).code(500);
    }
  };

const getHistoryToday = async (request, h) => {
    try {
        const { prisma, auth } = request;

        // Get today's start and end
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const histories = await prisma.history.findMany({
            where: { 
                userId: auth.userId, 
                selectedAt: { 
                    gte: startOfDay, 
                    lte: endOfDay 
                } 
            },
            include: {
                receipt: {
                    select: {
                        judul: true,
                        gambar: true,
                        kalori: true
                    }
                }
            },
            orderBy: {
                selectedAt: 'desc'
            }
        });

        // Get user's target calories for summary
        const user = await prisma.userProfile.findUnique({
            where: { id: auth.userId },
            select: { targetCalories: true }
        });

        const targetCalories = user?.targetCalories || 2000;

        // Transform data to simplified DailyFood interface
        const dailyFoodHistory = histories.map((history) => {
            const selectedTime = new Date(history.selectedAt);
            const timeString = selectedTime.toTimeString().slice(0, 5); // HH:mm format
            const dateString = selectedTime.toISOString().split('T')[0]; // YYYY-MM-DD format

            return {
                id: history.id, // Use UUID from history
                name: history.receipt.judul,
                calories: Math.round(history.receipt.kalori || 0), // Round float to integer
                time: timeString,
                date: dateString,
                category: history.category || "Makanan",
                image: history.receipt.gambar,
                capturedImage: history.photoUrl || history.receipt.gambar
            };
        });

        // Calculate summary
        const totalCalories = Math.round(dailyFoodHistory.reduce((sum, food) => sum + (food.calories || 0), 0));
        const remainingCalories = targetCalories - totalCalories;
        const todayDate = new Date().toISOString().split('T')[0];

        const summary = {
            totalCalories,
            targetCalories,
            remainingCalories,
            foodCount: dailyFoodHistory.length,
            date: todayDate
        };

        return h.response({
            status: 'success',
            data: { 
                dailyFoodHistory,
                summary
            }
        }).code(200);

    } catch (error) {
        console.error('Get history today error:', error);
        return h.response({
            status: 'error',
            message: 'Failed to fetch today\'s history'
        }).code(500);
    }
}

const getWeeklyBenchmark = async (request, h) => {
    try {
        const { prisma, auth } = request;

        // Get user's target calories
        const user = await prisma.userProfile.findUnique({
            where: { id: auth.userId },
            select: { targetCalories: true }
        });

        const dailyTargetCalories = user?.targetCalories || 2584; // Default target calories per day

        // Calculate start and end of current week (Sunday to Saturday)
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        // Get history data for the current week with receipt details
        const histories = await prisma.history.findMany({
            where: {
                userId: auth.userId,
                selectedAt: {
                    gte: startOfWeek,
                    lt: endOfWeek
                }
            },
            include: {
                receipt: {
                    select: {
                        kalori: true
                    }
                }
            }
        });

        // Initialize daily data
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyData = dayNames.map((day, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            return {
                day,
                totalCalories: 0,
                targetCalories: dailyTargetCalories,
                percentage: 0,
                date: date.toISOString().split('T')[0],
                isToday: date.toDateString() === now.toDateString()
            };
        });

        // Calculate daily totals
        histories.forEach(history => {
            const historyDate = new Date(history.selectedAt);
            const dayIndex = historyDate.getDay();
            dailyData[dayIndex].totalCalories += Math.round(history.receipt.kalori || 0);
        });

        // Calculate percentages and format data
        let totalWeeklyCalories = 0;
        let totalWeeklyPercentage = 0;
        const data = dailyData.map(day => {
            const percentage = Math.round((day.totalCalories / day.targetCalories) * 100);
            totalWeeklyCalories += day.totalCalories;
            totalWeeklyPercentage += percentage;
            
            return {
                ...day,
                percentage,
                targetCalories: day.targetCalories,
                totalCalories: day.totalCalories
            };
        });

        // Calculate summary (averages)
        const summary = {
            totalCalories: Math.round(totalWeeklyCalories / 7),
            targetCalories: dailyTargetCalories,
            achievement: Math.round(totalWeeklyPercentage / 7)
        };

        return h.response({
            status: 'success',
            data: {
                data,
                summary
            }
        }).code(200);

    } catch (error) {
        console.error('Get weekly benchmark error:', error);
        return h.response({
            status: 'error',
            message: 'Failed to fetch weekly benchmark'
        }).code(500);
    }
}

// Get most consumed ingredients for current user in the last 7 days (radar chart)
const getMostConsumedIngredients = async (request, h) => {
    try {
        const { prisma, auth } = request;

        // Calculate date range for last 7 days
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        // Get history data for the last 7 days with recipe ingredients
        const histories = await prisma.history.findMany({
            where: { 
                userId: auth.userId, 
                selectedAt: { 
                    gte: sevenDaysAgo, 
                    lte: endOfToday 
                } 
            },
            include: {
                receipt: {
                    include: {
                        ingredients: true
                    }
                }
            }
        });

        // Count how many times user consumed food containing each ingredient
        const ingredientFrequency = {};
        const totalMealsConsumed = histories.length;

        // Count frequency of each ingredient across all consumed meals
        histories.forEach(history => {
            if (history.receipt && history.receipt.ingredients) {
                // Get unique ingredients for this meal (avoid double counting in same meal)
                const uniqueIngredients = [...new Set(history.receipt.ingredients.map(ing => ing.bahan))];
                
                uniqueIngredients.forEach(bahanName => {
                    if (ingredientFrequency[bahanName]) {
                        ingredientFrequency[bahanName]++;
                    } else {
                        ingredientFrequency[bahanName] = 1;
                    }
                });
            }
        });

        // Convert to array and sort by frequency (most consumed first)
        const ingredientData = Object.entries(ingredientFrequency)
            .map(([bahan, count]) => ({
                bahan,
                count,
                // Calculate percentage based on how often user eats this ingredient
                frequency: (count / totalMealsConsumed) * 100
            }))
            .sort((a, b) => b.count - a.count); // Sort by actual consumption count

        // Get top 6 most frequently consumed ingredients
        const top6Ingredients = ingredientData.slice(0, 6);
        
        // If no ingredients found, return empty array
        if (top6Ingredients.length === 0) {
            return h.response({
                status: 'success',
                data: {
                    foodData: []
                }
            }).code(200);
        }
        
        // Normalize percentage (highest becomes 100%)
        const maxCount = top6Ingredients[0].count;
        
        const topIngredients = top6Ingredients.map(({ bahan, count }) => ({
            bahan,
            konsumsi: Math.round((count / maxCount) * 100)
        }));

        return h.response({
            status: 'success',
            data: {
                foodData: topIngredients
            }
        }).code(200);
        
    } catch (error) {
        console.error('Get most consumed ingredients error:', error);
        return h.response({
            status: 'error',
            message: 'Failed to fetch most consumed ingredients'
        }).code(500);
    }
}   

// Get history calories for current user in periodes (line chart) 1 week, 1 month, 6 months, 1 year
const getHistoryCalories = async (request, h) => {
    try {
        const { prisma, auth } = request;

        const now = new Date();
        const periods = [];

        // 1. WEEK PERIOD (Last 7 days)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const weekHistories = await prisma.history.findMany({
            where: {
                userId: auth.userId,
                selectedAt: {
                    gte: weekStart,
                    lte: now
                }
            },
            include: {
                receipt: {
                    select: { kalori: true }
                }
            }
        });

        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const weekData = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dayIndex = date.getDay();
            
            const dayCalories = weekHistories
                .filter(h => {
                    const historyDate = new Date(h.selectedAt);
                    return historyDate.toDateString() === date.toDateString();
                })
                .reduce((sum, h) => sum + (h.receipt.kalori || 0), 0);

            weekData.push({
                day: dayNames[dayIndex],
                calories: Math.round(dayCalories)
            });
        }

        periods.push({
            id: "week",
            label: "1 Minggu",
            dataKey: "day",
            data: weekData
        });

        // 2. MONTH PERIOD (Last 4 weeks)
        const monthStart = new Date(now);
        monthStart.setDate(now.getDate() - 28);
        monthStart.setHours(0, 0, 0, 0);

        const monthHistories = await prisma.history.findMany({
            where: {
                userId: auth.userId,
                selectedAt: {
                    gte: monthStart,
                    lte: now
                }
            },
            include: {
                receipt: {
                    select: { kalori: true }
                }
            }
        });

        const monthData = [];
        for (let i = 0; i < 4; i++) {
            const weekStartDate = new Date(monthStart);
            weekStartDate.setDate(monthStart.getDate() + (i * 7));
            
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6);
            weekEndDate.setHours(23, 59, 59, 999);

            const weekCalories = monthHistories
                .filter(h => {
                    const historyDate = new Date(h.selectedAt);
                    return historyDate >= weekStartDate && historyDate <= weekEndDate;
                })
                .reduce((sum, h) => sum + (h.receipt.kalori || 0), 0);

            monthData.push({
                week: `W${i + 1}`,
                calories: Math.round(weekCalories / 7) // Average per day in week
            });
        }

        periods.push({
            id: "month",
            label: "1 Bulan",
            dataKey: "week",
            data: monthData
        });

        // 3. SIX MONTHS PERIOD (Last 6 months)
        const sixMonthStart = new Date(now);
        sixMonthStart.setMonth(now.getMonth() - 5);
        sixMonthStart.setDate(1);
        sixMonthStart.setHours(0, 0, 0, 0);

        const sixMonthHistories = await prisma.history.findMany({
            where: {
                userId: auth.userId,
                selectedAt: {
                    gte: sixMonthStart,
                    lte: now
                }
            },
            include: {
                receipt: {
                    select: { kalori: true }
                }
            }
        });

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        const sixMonthData = [];

        for (let i = 0; i < 6; i++) {
            const monthDate = new Date(sixMonthStart);
            monthDate.setMonth(sixMonthStart.getMonth() + i);
            
            const monthEndDate = new Date(monthDate);
            monthEndDate.setMonth(monthDate.getMonth() + 1);
            monthEndDate.setDate(0);
            monthEndDate.setHours(23, 59, 59, 999);

            const monthCalories = sixMonthHistories
                .filter(h => {
                    const historyDate = new Date(h.selectedAt);
                    return historyDate.getMonth() === monthDate.getMonth() && 
                           historyDate.getFullYear() === monthDate.getFullYear();
                })
                .reduce((sum, h) => sum + (h.receipt.kalori || 0), 0);

            const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
            
            sixMonthData.push({
                month: monthNames[monthDate.getMonth()],
                calories: Math.round(monthCalories / daysInMonth) // Average per day in month
            });
        }

        periods.push({
            id: "sixmonth",
            label: "6 Bulan",
            dataKey: "month",
            data: sixMonthData
        });

        // 4. YEAR PERIOD (Last 5 years)
        const yearStart = new Date(now);
        yearStart.setFullYear(now.getFullYear() - 4);
        yearStart.setMonth(0);
        yearStart.setDate(1);
        yearStart.setHours(0, 0, 0, 0);

        const yearHistories = await prisma.history.findMany({
            where: {
                userId: auth.userId,
                selectedAt: {
                    gte: yearStart,
                    lte: now
                }
            },
            include: {
                receipt: {
                    select: { kalori: true }
                }
            }
        });

        const yearData = [];
        for (let i = 0; i < 5; i++) {
            const yearValue = yearStart.getFullYear() + i;
            
            const yearCalories = yearHistories
                .filter(h => {
                    const historyDate = new Date(h.selectedAt);
                    return historyDate.getFullYear() === yearValue;
                })
                .reduce((sum, h) => sum + (h.receipt.kalori || 0), 0);

            const isLeapYear = (yearValue % 4 === 0 && yearValue % 100 !== 0) || (yearValue % 400 === 0);
            const daysInYear = isLeapYear ? 366 : 365;

            yearData.push({
                year: yearValue.toString(),
                calories: Math.round(yearCalories / daysInYear) // Average per day in year
            });
        }

        periods.push({
            id: "year",
            label: "1 Tahun",
            dataKey: "year",
            data: yearData
        });

        return h.response({
            status: 'success',
            data: {
                periods
            }
        }).code(200);

    } catch (error) {
        console.error('Get history calories error:', error);
        return h.response({
            status: 'error',
            message: 'Failed to fetch history calories'
        }).code(500);
    }
}


module.exports = {
    getWeeklyCalories,
    getHistoryToday,
    getWeeklyBenchmark,
    getMostConsumedIngredients,
    getHistoryCalories
}