import Attendance from "../../models/attendance.model.js";
import Employee from "../../models/employee.model.js"
import mongoose from 'mongoose';


const OFFICE_START_TIME = 9;  // 9 AM
const OFFICE_END_TIME = 17;   // 5 PM (24-hour format)

function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++; // Skip weekends
    current.setDate(current.getDate() + 1);
  }
  return count;
}


// Clock In (Max 3 times per day)
export const clockIn = async (req, res) => {
  const userId = req.employee._id;
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  try {
    const existing = await Attendance.findOne({ userId, date: startOfDay });
    if (existing) {
  return res.status(400).json({
    message: "Already clocked in for today",
    session: existing
  });
}

    const clockInTime = new Date();
    const officeStartTime = new Date(startOfDay);
    officeStartTime.setHours(OFFICE_START_TIME, 0, 0, 0);

    const isLateArrival = clockInTime > officeStartTime;

    const attendance = await Attendance.create({
      userId,
      date: startOfDay,
      clockIn: clockInTime,
      breaks: [],
      status: "present",
      isLateArrival,
      isOnTime: !isLateArrival,
      workLocation: req.body.workLocation || "office" // Allow specifying work location
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const breakIn = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const attendance = await Attendance.findOne({ userId: req.employee._id, date: startOfDay });

    if (!attendance) return res.status(404).json({ message: "Clock-in required" });
    if (attendance.status === "onBreak") return res.status(400).json({ message: "Already on break" });

    attendance.breaks.push({ breakIn: new Date() });
    attendance.status = "onBreak";

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const breakOut = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const attendance = await Attendance.findOne({ userId: req.employee._id, date: startOfDay });

    if (!attendance || attendance.status !== "onBreak") {
      return res.status(400).json({ message: "No active break found" });
    }

    const currentBreak = attendance.breaks[attendance.breaks.length - 1];
    currentBreak.breakOut = new Date();

    const breakDuration = new Date(currentBreak.breakOut) - new Date(currentBreak.breakIn);
    attendance.totalBreakDuration = (attendance.totalBreakDuration || 0) + breakDuration;
    attendance.status = "present";

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clock Out
export const clockOut = async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  try {
    const attendance = await Attendance.findOne({ userId: req.employee._id, date: startOfDay });

    if (!attendance || attendance.clockOut) {
      return res.status(400).json({ message: "Already clocked out or no clock-in record" });
    }

    const now = new Date();
    attendance.clockOut = now;
    attendance.status = "loggedOut";

    // Calculate work duration
    const grossHours = now - attendance.clockIn;
    const effectiveHours = grossHours - (attendance.totalBreakDuration || 0);

    attendance.grossHours = grossHours / (1000 * 60 * 60); // convert ms to hours
    attendance.effectiveHours = effectiveHours / (1000 * 60 * 60);

    // Check for early departure
    const officeEndTime = new Date(startOfDay);
    officeEndTime.setHours(OFFICE_END_TIME, 0, 0, 0);
    attendance.isEarlyDeparture = now < officeEndTime;

    // Calculate overtime (anything over 8 effective hours)
    if (attendance.effectiveHours > 8) {
      attendance.overtimeHours = parseFloat((attendance.effectiveHours - 8).toFixed(2));
    }

    // Determine half-day status
    if (attendance.effectiveHours < 4) {
      attendance.status = "half-day";
    }

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.employee._id;
    const query = { userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await Attendance.find(query).sort({ date: -1 });

    const dailyStats = {};
    const sessions = [];
    let totalLateArrivals = 0;
    let totalEarlyDepartures = 0;

    logs.forEach(log => {
      sessions.push(log);

      const dateKey = log.date.toISOString().split("T")[0];

      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          effectiveHours: 0,
          grossHours: 0,
          overtimeHours: 0,
          isLateArrival: false,
          isEarlyDeparture: false,
          status: "present"
        };
      }

      dailyStats[dateKey].effectiveHours += log.effectiveHours || 0;
      dailyStats[dateKey].grossHours += log.grossHours || 0;
      dailyStats[dateKey].overtimeHours += log.overtimeHours || 0;
      dailyStats[dateKey].isLateArrival = log.isLateArrival;
      dailyStats[dateKey].isEarlyDeparture = log.isEarlyDeparture;
      dailyStats[dateKey].status = log.status;

      if (log.isLateArrival) totalLateArrivals++;
      if (log.isEarlyDeparture) totalEarlyDepartures++;
    });

    // Summary stats
    const summary = {
      totalDays: Object.keys(dailyStats).length,
      totalLateArrivals,
      totalEarlyDepartures: totalEarlyDepartures,
      totalOvertime: Object.values(dailyStats).reduce((sum, day) => sum + (day.overtimeHours || 0), 0),
      totalEffectiveHours: Object.values(dailyStats).reduce((sum, day) => sum + (day.effectiveHours || 0), 0),
      avgEffectiveHours: 0,
      complianceRate: 0
    };

    if (summary.totalDays > 0) {
      summary.avgEffectiveHours = parseFloat((summary.totalEffectiveHours / summary.totalDays).toFixed(2));
      summary.complianceRate = parseFloat((1 - ((totalLateArrivals + totalEarlyDepartures) / summary.totalDays)).toFixed(2));
    }

    res.json({
      sessions,
      dailyStats,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodayStatus = async (req, res) => {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const now = new Date();

  try {
    // 1. Get all active employees
    const allEmployees = await Employee.find({}, '_id name email department position employeeId');
    
    // 2. Get today's attendance records with breaks populated
    const attendanceRecords = await Attendance.find({ date: startOfDay })
      .lean();

    // 3. Create maps for easier lookup
    const employeeMap = new Map(allEmployees.map(emp => [emp._id.toString(), emp]));
    const presentEmployeeIds = new Set();

    // 4. Process present employees
    const presentStatus = [];
    const invalidRecords = [];

    attendanceRecords.forEach(record => {
      if (!record.userId) {
        invalidRecords.push({
          employee: null,
          attendanceId: record._id,
          status: 'invalid_reference',
          clockIn: record.clockIn,
          clockOut: record.clockOut,
          isLateArrival: record.isLateArrival,
          isEarlyDeparture: record.isEarlyDeparture,
          effectiveHours: record.effectiveHours,
          workLocation: record.workLocation,
          error: "User reference is null"
        });
        return;
      }

      const employeeId = record.userId.toString();
      const employee = employeeMap.get(employeeId);

      if (!employee) {
        invalidRecords.push({
          employee: null,
          attendanceId: record._id,
          status: 'invalid_reference',
          clockIn: record.clockIn,
          clockOut: record.clockOut,
          isLateArrival: record.isLateArrival,
          isEarlyDeparture: record.isEarlyDeparture,
          effectiveHours: record.effectiveHours,
          workLocation: record.workLocation,
          error: "Associated employee not found"
        });
        return;
      }

      // Check if employee is currently on break
      let isOnBreak = false;
      if (record.breaks && record.breaks.length > 0) {
        const lastBreak = record.breaks[record.breaks.length - 1];
        isOnBreak = lastBreak.breakIn && !lastBreak.breakOut;
      }

      presentEmployeeIds.add(employeeId);
      presentStatus.push({
        employee: {
          _id: employee._id,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          position: employee.position
        },
        status: isOnBreak ? 'onBreak' : (record.status || 'present'),
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        isLateArrival: record.isLateArrival,
        isEarlyDeparture: record.isEarlyDeparture,
        effectiveHours: record.effectiveHours,
        workLocation: record.workLocation,
        isOnBreak: isOnBreak,
        currentBreakDuration: isOnBreak ? 
          Math.floor((now - new Date(record.breaks[record.breaks.length - 1].breakIn)) / (1000 * 60)) : 
          null
      });
    });

    // 5. Add absent employees (those who haven't clocked in)
    const absentStatus = allEmployees
      .filter(emp => !presentEmployeeIds.has(emp._id.toString()))
      .map(emp => ({
        employee: {
          _id: emp._id,
          name: emp.name,
          email: emp.email,
          department: emp.department,
          position: emp.position
        },
        status: 'absent',
        clockIn: null,
        clockOut: null,
        isLateArrival: false,
        isEarlyDeparture: false,
        effectiveHours: 0,
        workLocation: null,
        isOnBreak: false,
        currentBreakDuration: null
      }));

    // 6. Combine all results
    const status = [...presentStatus, ...absentStatus, ...invalidRecords];

    res.json({
      success: true,
      data: status,
      counts: {
        present: presentStatus.length,
        absent: absentStatus.length,
        onBreak: presentStatus.filter(s => s.isOnBreak).length,
        invalidRecords: invalidRecords.length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message,
      error: error.stack 
    });
  }
};
export const getEmployeeList = async (req, res) => {
  try {
    const { department, includeInactive } = req.query;
    
    const query = { active: true }; // Default to only active employees
    if (department) query.department = department;
    if (includeInactive === 'true') delete query.active; // Remove active filter if including inactive
    
    const employees = await Employee.find(query)
      .select('_id name email department position employeeId active')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getEmployeeAttendanceDetails = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Date filtering
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { userId: employeeId };
    if (startDate || endDate) query.date = dateFilter;

    // Get all attendance records
    const records = await Attendance.find(query).sort({ date: -1 });

    // Calculate working days in period
    const periodStart = startDate ? new Date(startDate) : records.length > 0 
      ? new Date(Math.min(...records.map(r => r.date.getTime()))) 
      : new Date();
    const periodEnd = endDate ? new Date(endDate) : new Date();
    const workingDays = calculateWorkingDays(periodStart, periodEnd);

    // Calculate statistics
    const presentDays = records.filter(r => ['present', 'loggedOut'].includes(r.status)).length;
    const halfDays = records.filter(r => r.status === 'half-day').length;
    const absentDays = workingDays - presentDays - halfDays;

    const totalEffectiveHours = records.reduce((sum, r) => sum + (r.effectiveHours || 0), 0);
    const totalOvertime = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

    res.json({
      success: true,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        employeeId: employee.employeeId
      },
      period: {
        start: periodStart,
        end: periodEnd,
        workingDays
      },
      statistics: {
        presentDays,
        halfDays,
        absentDays,
        attendanceRate: workingDays > 0 ? parseFloat(((presentDays + halfDays * 0.5) / workingDays).toFixed(2)) : 0,
        totalEffectiveHours: parseFloat(totalEffectiveHours.toFixed(2)),
        totalOvertime: parseFloat(totalOvertime.toFixed(2)),
        avgDailyHours: presentDays > 0 ? parseFloat((totalEffectiveHours / presentDays).toFixed(2)) : 0,
        lateArrivals: records.filter(r => r.isLateArrival).length,
        earlyDepartures: records.filter(r => r.isEarlyDeparture).length
      },
      recentRecords: records.slice(0, 10) // Last 10 records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

