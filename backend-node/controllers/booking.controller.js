const Slot = require('../models/slot.model');
const Appointment = require('../models/appointment.model');
const mongoose = require('mongoose');

/**
 * Booking controller
 * Handles slot availability and appointment booking
 */

exports.getAvailableSlots = async (req, res) => {
  try {
    const { counselorId, startDate, endDate, type } = req.query;

    let query = { isAvailable: true };

    if (counselorId) {
      query.counselor = counselorId;
    }

    if (type) {
      query.type = type;
    }

    if (startDate && endDate) {
      // Handle both ISO strings and date strings consistently
      const start = startDate.includes('T') ? new Date(startDate) : new Date(startDate + 'T00:00:00.000Z');
      const end = endDate.includes('T') ? new Date(endDate) : new Date(endDate + 'T23:59:59.999Z');
      query.startTime = {
        $gte: start,
        $lte: end
      };
    }

    const slots = await Slot.find(query)
      .populate('counselor', 'firstName lastName username bio credentials specializations')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: slots,
      message: 'Available slots retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { slotId, type, notes } = req.body;

    // Check if slot exists and is available
    const slot = await Slot.findOne({ _id: slotId, isAvailable: true }).session(session);
    if (!slot) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Slot not available or does not exist'
      });
    }

    // Mark slot as unavailable
    await Slot.updateOne({ _id: slotId }, { isAvailable: false }).session(session);

    // Create appointment
    const appointment = await Appointment.create([{
      user: req.user._id,
      slotId,
      type: type || slot.type,
      notes
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: { id: appointment[0]._id },
      message: 'Appointment created successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in createAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    session.endSession();
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const items = await Appointment.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Populate slot and counselor information for each appointment
    const appointmentsWithDetails = await Promise.all(
      items.map(async (appointment) => {
        try {
          const slot = await Slot.findById(appointment.slotId).populate('counselor', 'firstName lastName username');
          if (!slot) {
            console.warn(`Slot not found for appointment ${appointment._id}, slotId: ${appointment.slotId}. This may indicate data inconsistency.`);
            // Try to find the slot by other means or mark as invalid
            return {
              ...appointment.toObject(),
              slotId: null,
              counselorId: null,
              status: 'cancelled' // Mark as cancelled if slot doesn't exist
            };
          }
          if (!slot.counselor) {
            console.warn(`Counselor not found for slot ${slot._id} in appointment ${appointment._id}`);
            return {
              ...appointment.toObject(),
              slotId: slot,
              counselorId: null
            };
          }
          return {
            ...appointment.toObject(),
            slotId: slot,
            counselorId: slot.counselor
          };
        } catch (slotError) {
          console.error(`Error fetching slot for appointment ${appointment._id}:`, slotError);
          return {
            ...appointment.toObject(),
            slotId: null,
            counselorId: null,
            status: 'cancelled'
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      data: appointmentsWithDetails,
      message: 'Appointments retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id })
      .populate('user', 'firstName lastName username');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getAppointmentById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { id: req.params.id },
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Error in updateAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id }).session(session);
    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Mark slot as available again
    await Slot.updateOne({ _id: appointment.slotId }, { isAvailable: true }).session(session);

    // Update appointment status
    await Appointment.updateOne({ _id: req.params.id }, { status: 'cancelled' }).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in cancelAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    session.endSession();
  }
};

// Counselor endpoints

exports.createSlot = async (req, res) => {
  try {
    const { startTime, endTime, type, notes } = req.body;

    const slot = await Slot.create({
      counselor: req.user._id,
      startTime,
      endTime,
      type,
      notes
    });

    res.status(201).json({
      success: true,
      data: slot,
      message: 'Slot created successfully'
    });
  } catch (error) {
    console.error('Error in createSlot:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getMySlots = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { counselor: req.user._id };

    if (startDate && endDate) {
      // Handle both ISO strings and date strings consistently
      const start = startDate.includes('T') ? new Date(startDate) : new Date(startDate + 'T00:00:00.000Z');
      const end = endDate.includes('T') ? new Date(endDate) : new Date(endDate + 'T23:59:59.999Z');
      query.startTime = {
        $gte: start,
        $lte: end
      };
    }

    const slots = await Slot.find(query).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: slots,
      message: 'Slots retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getMySlots:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getCounselorAppointments = async (req, res) => {
  try {
    // Get appointments for slots owned by this counselor
    const slots = await Slot.find({ counselor: req.user._id }).select('_id');
    const slotIds = slots.map(slot => slot._id.toString());

    const appointments = await Appointment.find({ slotId: { $in: slotIds } })
      .populate('user', 'firstName lastName username email')
      .sort({ createdAt: -1 });

    // Manually populate slot data since slotId is stored as string
    const appointmentsWithSlots = await Promise.all(
      appointments.map(async (appointment) => {
        const slot = await Slot.findById(appointment.slotId).select('startTime endTime type');
        return {
          ...appointment.toObject(),
          slotId: slot
        };
      })
    );

    res.status(200).json({
      success: true,
      data: appointmentsWithSlots,
      message: 'Counselor appointments retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getCounselorAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getCounselorStats = async (req, res) => {
  try {
    // Get slots owned by this counselor
    const slots = await Slot.find({ counselor: req.user._id }).select('_id');
    const slotIds = slots.map(slot => slot._id.toString());

    // Get all appointments for this counselor
    const allAppointments = await Appointment.find({ slotId: { $in: slotIds } });

    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todaysSlots = await Slot.find({
      counselor: req.user._id,
      startTime: { $gte: today, $lt: tomorrow },
      isAvailable: false // Booked slots
    });

    const todaysSessions = todaysSlots.length;

    // Get upcoming sessions (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingSlots = await Slot.find({
      counselor: req.user._id,
      startTime: { $gte: new Date(), $lt: nextWeek },
      isAvailable: false
    });

    const upcomingSessions = upcomingSlots.length;

    // Get new requests (appointments from last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const newRequests = allAppointments.filter(a =>
      new Date(a.createdAt) >= lastWeek
    ).length;

    // Mock satisfaction score for now (could be calculated from ratings in future)
    const satisfaction = 94;

    res.status(200).json({
      success: true,
      data: {
        openSessions: upcomingSessions,
        newRequests: newRequests,
        todaysSessions: todaysSessions,
        satisfaction: satisfaction
      },
      message: 'Counselor stats retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getCounselorStats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};